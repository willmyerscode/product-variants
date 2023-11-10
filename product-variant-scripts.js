/* =========
  Product Variants
  This Code is Licensed by Will-Myers.com
========== */
class SwatchBuilder {
  constructor() {
    this.variantOptions = document.querySelectorAll('.grid-item .variant-option, .pdp-details .variant-option, .product-details .variant-option, .sqs-block-product .variant-option');
    this.viewOptionsButtons = document.querySelectorAll('.sqs-view-options-button-inner');
    this.script = document.querySelector('script[data-plugin="wm-product-variants"]')
    this.pluginMode = this.script ? this.script.dataset.mode : 'live';
    this.isBackend = window.self !== window.top;
    this.collectionPageVariants = ['Color', 'Materials'];
    this.init()
    this.initCreateVariants()
  }

  init() {
    if ((this.pluginMode === 'dev') && !this.isBackend) return;
    for (let option of this.variantOptions) {
      this.buildSwatchFromSelect(option);
    }
    this.initImages();
  }
  async initCreateVariants() {
    this.viewOptionsBtns = document.querySelectorAll('.sqs-view-options-button-inner');
    if (!this.viewOptionsBtns.length) return;
    const items = await this.getUnlistedOptions();
    this.customVariantProducts = Array.from(this.viewOptionsBtns).map((element) => {
      const newVariant = { 
        viewOptionsSpan: element,
        viewOptionsBtn: element.closest('a.sqs-view-options-button-wrapper'),
        optionsContainer: null,
        item: element.closest('.grid-item')
      }

      newVariant.imageContainer = newVariant.item.querySelector('.grid-image-wrapper');
      newVariant.id = newVariant.item.dataset.itemId;
      newVariant.variants = items.filter(item => {
        return (item.id === newVariant.id)
      })[0].variants
      
      return newVariant;
    });
    this.customVariantProducts.forEach(product => this.buildCustomVariant(product))
  }

  buildSwatchFromSelect(option) {
    const select = option.querySelector('select');
    const variants = select.querySelectorAll('option');
    const name = select.dataset.variantOptionName;
    const title = option.querySelector('.variant-option-title');
    let initialTitle;
    if (title) initialTitle = title.innerText;

    const newVariantContainer = document.createElement('div');
    newVariantContainer.classList.add('wm-variants');
    if (name) newVariantContainer.dataset.variantOptionName = name;

    for (let variant of variants) {
      const value = variant.value;
      if (!value) continue;
      const newVariant = document.createElement('button');
      newVariant.classList.add('wm-variant');
      newVariant.dataset.variant = value;
      newVariantContainer.append(newVariant);
      newVariant.innerHTML = `<span>${value}</span>`;
      newVariant.title = value;
      newVariant.addEventListener('click', (e) => {
        this.setVariant(newVariant, select)
        if (title) title.innerHTML = `${initialTitle} <span class="selected-variant-title">${value}</span>`;
      });
      if (this.isColor(value)) {
        newVariant.style.setProperty('--variant-background', value);
      }
    }
    option.classList.add('wm-custom-variants')
    option.append(newVariantContainer);
  }
  buildCustomVariant(product) {
    const viewOptionsBtn = product.viewOptionsBtn;
    const seenVariants = new Set();
    const imgContainer = product.imageContainer;
    const colorVariants = product.variants.filter(variant => {
      const colorAttribute = variant.attributes.Color;
      if ("Color" in variant.attributes && !seenVariants.has(colorAttribute)) {
        seenVariants.add(colorAttribute);
        return true;
      }
      return false;
    });
    if (!colorVariants.length) return;

    //Add Toggles
    const newVariantContainer = document.createElement('div');
    const isColor = (valueString) => {
      const value = this.isColor(valueString)
      if (value) return `--variant-background: ${value}`
      return ''
    }
    
    newVariantContainer.classList.add('product-variants', 'wm-custom-variants');
    newVariantContainer.innerHTML = `<div class="variant-option wm-custom-variants">
      <div class="wm-variants" data-variant-option-name="Color">
        ${colorVariants.map(variant => (
          `<button class="wm-variant" data-variant="${variant.attributes.Color}" title="${variant.attributes.Color}" data-img-id="${variant.mainImageId}" style="${isColor(variant.attributes.Color)}"> <span>${variant.attributes.Color} </span></button>`
        )).join('')}
      </div>
    </div>`;
    viewOptionsBtn.insertAdjacentElement('beforebegin', newVariantContainer);

    
    newVariantContainer.addEventListener('click', (e) => {
      let btn = e.target.closest('.wm-variant')
      if (!btn) return;
      let id = btn.dataset.imgId;
      let image = btn.closest('.grid-item').querySelector(`.grid-image-wrapper [data-image-id="${id}"]`);

      newVariantContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'))
      btn.classList.add('active');
      if (image) {
        imgContainer.querySelectorAll('img').forEach(img => {
          img.classList.remove('grid-image-selected')
          img.classList.add('grid-image-not-selected')
        })
        image.classList.add('grid-image-selected')
        image.classList.remove('grid-image-not-selected')
      }
    })

    let images = imgContainer.querySelectorAll('[data-src]');
    images.forEach(img => img.src = img.dataset.src);
    

    //Add Images
    // const imagesHTML = colorVariants.map(variant => (
    //   `<img src="${variant.mainImage.assetUrl}" data-img-id="${variant.mainImageId}"/>`
    //   ));
    // //imgContainer.insertAdjacentHTML('afterbegin', imagesHTML);
  }

  async getUnlistedOptions() {
    const isCollection = document.querySelector('section.products.products-list');
    if (!isCollection) return;
    const response = await fetch('https://wm-series.squarespace.com/store-1-1?format=json-pretty');
    const json = await response.json();
    return json.items;
  }

  getUniqueColorVariants(variants) {
    const seenColors = new Set();
    return variants.filter(item => {
      const color = item.attributes.Color;
      if (!seenColors.has(color)) {
        seenColors.add(color);
        return true;
      }
      return false;
    });
  };
  setVariant(button, select) {
    Array.from(button.parentElement.children).forEach(btn => btn.classList.remove('active'))
    button.classList.add('active');
    select.value = button.dataset.variant;
    select.dispatchEvent(new Event('change'));
  }
  isColor(colorString) {
    let el = document.createElement('div');
    el.style.backgroundColor = colorString;
    document.body.appendChild(el);
    let style = window.getComputedStyle(el).backgroundColor;
    document.body.removeChild(el);
    if (style === 'rgba(0, 0, 0, 0)') style = null;
    return style;
  }
  initImages(){
    let images = document.querySelectorAll('.sqs-block-product [data-src]');
    images.forEach(img => img.src = img.dataset.src)
  }
}

const wmBuildSwatches = new SwatchBuilder();
