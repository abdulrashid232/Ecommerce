import { calculateCartQuantity, cart, deleteFromCart, updateCartQuantity, updateDeliveryOption } from "../../data/cart.js";
import {products} from "../../data/products.js"
import { formatPrice } from "../utils/price.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { deliveryOptions } from "../../data/deliveryOption.js";


export function renderOrderSummary(){
  cartQuantity();
  let cartSummary = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    let matchingProduct;

    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product
      }
    }); 
    const deliveryOptionId = cartItem.deliveryOptionId;

    let deliveryOption;

    deliveryOptions.forEach((option)=>{
      if(deliveryOptionId === option.id){
        deliveryOption = option;
      }
    });
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    cartSummary +=
      `<div class="cart-item-container
    js-cart-container-${matchingProduct.id}">
      <div class="delivery-date">
      Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
      <img class="product-image"
      src="${matchingProduct.image}">

      <div class="cart-item-details">
        <div class="product-name">
          ${matchingProduct.name}
        </div>
      <div class="product-price">$${formatPrice(matchingProduct.priceCents)}
      </div>
      <div class="product-quantity">
        <span>
          Quantity: <span class="quantity-label js-quantity-${matchingProduct.id}">${cartItem.quantity}</span>
      </span>
      <span class="update-quantity-link link-primary js-update-link" data-product-id= '${matchingProduct.id}'>
      Update
      </span>
      <input class="quantity-input update-input js-input-${matchingProduct.id}">
      <span class="save-quantity-link link-primary js-save-link" data-product-id= '${matchingProduct.id}'>Save</span>
      <span class="delete-quantity-link link-primary js-delete-link" data-product-id= '${matchingProduct.id}'>
      Delete
      </span>
      </div>
      </div>

      <div class="delivery-options">
      <div class="delivery-options-title">
      Choose a delivery option:
      </div>  
        ${deliveryOptionsHTML(matchingProduct,cartItem)}
      </div>
      </div>
  </div>
    `;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let deliveryHtml =''; 
    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = deliveryOption.priceCents === 0 
      ?
      'FREE Shipping': `$${formatPrice(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id ===cartItem.deliveryOptionId;
      
      deliveryHtml +=
      `
      <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
      <input type="radio"
      ${isChecked ? 'checked': ''}
      class="delivery-option-input"
      name="delivery-option-${matchingProduct.id}">
      <div>
      <div class="delivery-option-date">
      ${dateString}
      </div>
      <div class="delivery-option-price">
      ${priceString} - Shipping
      </div>
      </div>
      </div>
      `
    })
    return deliveryHtml 
  }
  document.querySelector('.order-summary')
    .innerHTML = cartSummary

  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        deleteFromCart(productId);

        const container = document.querySelector(`.js-cart-container-${productId}`);

        container.remove();
        cartQuantity();
      })

    });

  document.querySelectorAll('.js-update-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(`.js-cart-container-${productId}`);
        container.classList.add('is-editing-quantity');


        document.querySelectorAll('.quantity-input')
          .forEach((input) => {
            input.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                const container = document.querySelector(`.js-cart-container-${productId}`);

                container.classList.remove('is-editing-quantity');

                const newQuantity = Number(document.querySelector(`.js-input-${productId}`).value);

                if (newQuantity >= 0 && newQuantity < 1000) {
                  updateCartQuantity(productId, newQuantity);
                  cartQuantity();
                  document.querySelector(`.js-quantity-${productId}`)
                    .textContent = newQuantity;
                } else {
                  alert('Invalid Quantity');
                }
              }
            });
          });
      });

    });

  document.querySelectorAll('.js-save-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(`.js-cart-container-${productId}`);

        container.classList.remove('is-editing-quantity');

        const newQuantity = Number(document.querySelector(`.js-input-${productId}`).value);

        if (newQuantity >= 0 && newQuantity < 1000) {
          updateCartQuantity(productId, newQuantity);
          cartQuantity();
          document.querySelector(`.js-quantity-${productId}`)
            .textContent = newQuantity;
        } else {
          alert('Invalid Quantity');
        }

      });
    });

  function cartQuantity() {
    document.querySelector('.js-checkout-quantity')
      .innerHTML = `${calculateCartQuantity()} items`;
  }

  document.querySelectorAll('.js-delivery-option')
    .forEach((optionElement)=>{
      optionElement.addEventListener('click', ()=>{
        const {productId,deliveryOptionId} = optionElement.dataset
        updateDeliveryOption(productId,deliveryOptionId);
        renderOrderSummary();
      });
    });
}

