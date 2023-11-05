/* =========
  Product Variants
  This Code is Licensed by Will-Myers.com
========== */

class SwatchBuilder {
  constructor() {
    this.variantOptions = document.querySelectorAll('.grid-item .variant-option, .pdp-details .variant-option, .product-details .variant-option');
    this.script = document.querySelector('script[data-plugin="wm-product-variants"]')
    this.pluginMode = this.script ? this.script.dataset.mode : 'live';
    this.isBackend = window.self !== window.top;
    this.init()
  }

  init() {
    if ((this.pluginMode === 'dev') && !this.isBackend) return;
    console.log('run')
    this.buildSwatches();
  }
  
  buildSwatches() {
    for (let option of this.variantOptions) {
      const select = option.querySelector('select');
      const variants = select.querySelectorAll('option');
      const newVariantContainer = document.createElement('div');
      const name = select.dataset.variantOptionName;
      const title = option.querySelector('.variant-option-title');
      let initialTitle;
      if (title) initialTitle = title.innerText;
      
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
  }

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
}

const wmBuildSwatches = new SwatchBuilder();
