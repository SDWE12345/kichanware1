export const initFacebookPixel = (YOUR_PIXEL_ID) => {
  if (typeof window !== 'undefined') {
    // Initialize Facebook Pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    console.log("YOUR_PIXEL_ID","964331515762542");
    
    fbq('init', "964331515762542"); // Replace with your actual Pixel ID
    fbq('track', 'PageView');
  }
};

export const trackFacebookEvent = (eventName, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    fbq('track', eventName, options);
  }
};

export const FbPixelEvents = {
  // Basic Page Tracking
  pageView: () => trackFacebookEvent('PageView'),
  PurchaseView: () => trackFacebookEvent('PurchaseView'),
  
  // Product Events
  productView: (product) => trackFacebookEvent('ProductView', product),
  
  // Cart Events
  addToCart: (product) => trackFacebookEvent('AddToCart',product ),
  
  removeFromCart: (product, quantity = 1) => trackFacebookEvent('RemoveFromCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    currency: product.currency || 'USD',
    value: product.price * quantity,
    quantity: quantity
  }),
  
  // Checkout Events
  initiateCheckout: (products, totalValue) => trackFacebookEvent('InitiateCheckout', {
    content_ids: products.map(p => p.id),
    content_type: 'product',
    currency: products[0]?.currency || 'USD',
    value: totalValue,
    num_items: products.reduce((sum, p) => sum + (p.quantity || 1), 0)
  }),
  
  checkoutStep: (step, products, totalValue) => trackFacebookEvent('Checkout', {
    content_ids: products.map(p => p.id),
    content_type: 'product',
    currency: products[0]?.currency || 'USD',
    value: totalValue,
    num_items: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
    checkout_step: step
  }),
  
  // Purchase Events
  purchase: (data) => trackFacebookEvent('InitiateCheckout', data),
  
  purchaseStatus: (status) => trackFacebookEvent('Purchase', status),
  
  // Custom Events
  customEvent: (eventName, customData) => trackFacebookEvent(eventName, customData)
};
