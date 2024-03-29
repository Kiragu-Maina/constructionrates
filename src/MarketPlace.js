
import './MarketPlace.css'

import { useState, useEffect, useContext } from 'react';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import cloudinary from 'cloudinary-core';
import Axios from "axios";
import { API_ENDPOINT_1 } from './apis/api';
import { AuthContext } from './AuthContext';
import Select from 'react-select';
import { measurements } from './shop/data/measurements';

const MarketPlace = () => {
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [components, setComponents] = useState([]);
  const [viewingComponent, setViewingComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageurl] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchValue2, setSearchValue2] = useState('');


  // const { user } = useContext(AuthContext);
  const user = localStorage.getItem('user');

  const tokenizer = localStorage.getItem('auth_token');

  useEffect(() => {
    // Retrieve components from local storage on component mount

    const storedComponents = localStorage.getItem('components');
    if (storedComponents) {
      setComponents(JSON.parse(storedComponents));
    }
  }, []);
  useEffect(() => {
    // Fetch data from the API endpoint
    fetch(`${API_ENDPOINT_1}/apis/categories/`)
      .then(response => response.json())

      .then(result => {
        setCategories(result);
        console.log(result);

        // setLoading(false); // Set loading to false after data is fetched
      });
  }, []);

  const handleReload = () => {
    // Reload the page
    window.location.reload(false);
  };

  const handleSelectedCategory = (selectedOption) => {
    setCategory(selectedOption);
  }
  const handleSubtitleChange = (selectedsubtitle) => {
    setSubtitle(selectedsubtitle);
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'itemName') {
      setItemName(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'price') {
      setPrice(value);
    } else if (name === 'quantity') {
      setQuantity(value);
    }

  };

  const handleDelete = (index) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    setComponents(updatedComponents);
    localStorage.setItem('components', JSON.stringify(updatedComponents));
  };
  const handleView = (index) => {
    // Retrieve the component object using the index
    const viewingComponent = components[index];

    // Perform the desired actions for editing/viewing the component
    // For example, you can set the component as the current editing component in the state
    setViewingComponent(viewingComponent);

    // You can also navigate to a different page or display a modal for editing/viewing the component
    // Modify the code based on your specific requirements
  };
  const handleClick = (event) => {
    if (event) {
      event.preventDefault();
    }
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create a new component object
    const newComponent = {
      itemName,
      description,
      price,
      quantity,
      category,
      subtitle,
      image: event.target.picture.files[0], // Access the uploaded image file
    };


    // Update components state and save to local storage
    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    localStorage.setItem('components', JSON.stringify(updatedComponents));

    // Clear form inputs
    setItemName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategory('');
    setSubtitle('');

    // Hide the form after submission
    setShowForm(false);
  };



  const handleAllComponentsSubmitToEndpoint = async () => {
    try {
      setLoading(true); // Display a loading state to the user

      // Convert the components data to product format
      const products = await Promise.all(
        components.map(async (component) => {
          try {
            // Upload the image to Cloudinary
            const formData = new FormData();
            formData.append("file", component.image);
            formData.append("upload_preset", "a5bkfjiv");

            const response = await Axios.post(
              "https://api.cloudinary.com/v1_1/dzac7jcg9/image/upload",
              formData
            );

            // Handle the image upload response
            console.log(response);
            setImageurl(response.data.secure_url);
            console.log(response.data.secure_url);

            const product = {
              title: component.itemName,
              description: component.description,
              subtitle: component.subtitle,
              category: component.category,
              price: component.price,
              quantity: component.quantity,
              image: response.data.secure_url, // Use the Cloudinary image URL
            };
            return product;
          } catch (error) {
            console.log(error);
            throw new Error("Failed to upload image");
          }
        })
      );

      console.log(products); // This will show you the array of products with uploaded image URLs

      // Send the products data to the API endpoint as JSON
      const response = await fetch(`${API_ENDPOINT_1}/apis/products/${user}/0/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
      });

      // Check if the request was successful
      if (response.ok) {
        // Clear the components data
        setComponents([]);
        localStorage.removeItem('components');

        // Display a success message to the user
        alert('Products added successfully!');
        // handleReload();
      } else {
        // Display an error message to the user
        alert('Failed to add products.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Hide the loading state
      setLoading(false);
    }
  };
  if (loading) {
    // Display loading indicator while data is being fetched
    return <div>Loading...</div>;
  }



  return (
    <div className="marketplace-container">
      {!showForm && (
        <button className="add-component-button" onClick={() => setShowForm(true)}>
          Add Item
        </button>
      )}

      {showForm && (
        <div className="add-component-container">


          <form onSubmit={handleSubmit} className="marketplace-form">




            <br />

            <label className='labelformarket'>
              Item Name:
              <input
                type="text"
                name="itemName"
                value={itemName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </label>
            <br />
            <label className='labelformarket'>
              Category:

              <Select className="selectcategory"
                isSearchable

                options={categories.map(category => ({ value: category, label: category }))}
                placeholder={searchValue ? searchValue : "Search.."}

                onChange={(selectedOption) => {
                  // Store the selected search value in the state variable
                  setSearchValue(selectedOption.value);
                  handleSelectedCategory(selectedOption.value);

                }}
                required
              />


            </label>
            <br />
            <label className='labelformarket'>
              Description:
              <textarea
                name="description"
                value={description}
                onChange={handleInputChange}
                className="form-textarea"
                required
              />
            </label>
            <br />
            <label className='labelformarket'>
              Price:
              <input
                type="number"
                name="price"
                value={price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </label>
            <br />
            <div className="form-horizontal">
              <label className='labelformarket'>
                Quantity:
                <input
                  type="number"
                  name="quantity"
                  value={quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </label>
              <div className='subtitle'>
                <label className="labelformarket">
                  Unit:
                  <Select className='selectsubtitle'
                    isSearchable

                    options={measurements.map(measurement => ({ value: measurement, label: measurement }))}
                    placeholder={searchValue2 ? searchValue2 : "Search.."}

                    onChange={(selectedsubtitle) => {
                      console.log(selectedsubtitle);
                      setSearchValue2(selectedsubtitle.value);
                      handleSubtitleChange(selectedsubtitle.value);
                    }

                    }

                    required

                  />
                </label>
              </div>
            </div>
            <br />
            <label className='labelformarket'>
              Picture:
              <input
                type="file"
                name="picture"
                accept="image/*"
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </label>
            <br />
            <button type="submit" className="submit-button">
              Submit
            </button>
            <br />
            <button className="back-btn" onClick={() => setShowForm(false)}>Close</button>
          </form>
        </div>
      )}
      <div className="component-list-container">
        <h3 className='header2tag'>Preview added products:</h3>
        {components.map((component, index) => (
          <div key={index} className="component-entry">
            <span className="counter">{index + 1}. </span>
            <span className="item-name">{component.itemName}</span>
            <span className="price">Price: {component.price}</span>
            <span className="quantity">Quantity: {component.quantity}</span>
            <button className="list-button" onClick={() => handleDelete(index)}>Delete</button>
            <button className="list-button2" onClick={() => handleView(index)}>View</button>


          </div>
        ))}
        {viewingComponent && (
          <div className="component-details">
            <h3>{viewingComponent.itemName}</h3>
            <p>Description: {viewingComponent.description}</p>
            <p>Price: {viewingComponent.price}</p>
            <p>Quantity: {viewingComponent.quantity}</p>
            {viewingComponent.imageUrl && (
              <img src={viewingComponent.imageUrl} alt="Component Image" />
            )}
            <button className="list-button2" onClick={() => setViewingComponent(null)}>
              Close
            </button>
          </div>
        )}
        <button className="list-button3" onClick={handleAllComponentsSubmitToEndpoint} disabled={loading}>
          {loading ? 'Loading...' : 'Push to Marketplace'}
        </button>
      </div>

    </div>
  );
};

export default MarketPlace
