import Tree from '../tree.mjs';
import MDC from '../mdc.mjs';

describe('MDC', function () {
  function testComponent({debug, typeName, defaultHTML, specifiedHTML, modeledHTML, specifiedProperties = {}, modelProperties = specifiedProperties}) {
    // FIXME: Does not yet cover style options and variants.
    describe(typeName, function () {
      let model = modelProperties && new Tree(modelProperties),
          constructor = MDC[typeName],
          naked = new constructor(),
          specified = specifiedProperties && new constructor(specifiedProperties),
          modeled = model && new constructor({model}),
          displayInstances = [naked, specified, modeled];
      beforeAll(async function () {
        await Promise.all(displayInstances.map(async instance => instance && instance.update));
      });
      function generates(instance, html) {
        // NOTE: Here we are checking that our views generate the HTML from material.io. It would be nicer
        // to check that we have the same behavior wrt display, events, and ARIA, but that's quite diffucult,
        // and it ends up being a test of MDC itself, which is more than we want to take on here.
        // But as a result, this is testing for results that might be different in future versions.
        //
        // TODO: instead of an exact match, make sure every tagName & attribute of html is contained, recursively.
        // I.e., allowing for additional attributes and structure.
        if (debug) console.log({typeName, instance, html: instance.display.outerHTML});
        function allowId(s) {
          return s
            .replace(/id="[^"]*"/g, 'id="XXX"')
            .replace(/aria-labelledby="[^"]*"/g, 'id="XXX"')
            .replace(/for="[^"]*"/g, 'for="XXX"');
        }
        html = allowId(html.replace(/\n */g, ''));
        const got = allowId(instance.display.outerHTML.replace(/ style="[^"]*"/g, ''))
        expect(got).toBe(html);
      }
      it('generates good default HTML.', function () {
        generates(naked, defaultHTML);
      });
      if (specified) {
        it('allows directly specified options.', function () {
          generates(specified, specifiedHTML);
        });
      }
      if (model) {
        it('tracks model.', function () {
          generates(modeled, modeledHTML);
        });
      }
    });
  }
  describe('simple component', function () {
    // Representing a single more-or-less-atomic thing.
    describe('output', function () {
      describe('Typography', function () {
        // Text, either as a div (headline or subtitle) or a body of text. Any could have spans with, e.g., italics.
        
        // Note: Libraries such as MDC and React Material-UI do not inject Roboto, and neither do we.
        // Applications pick whatever font they want, such as by including
        // <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
        it('injects mdc-typography to body.', function () {
          expect(document.body.classList.contains('mdc-typography')).toBeTruthy();
        });
        // TBD: There are many CSS custom style properties that can be specified.
        // https://material.io/develop/web/guides/typography#css-custom-properties
        // How should javascript specify these for a portion of the tree, and how will we test that?
        function testTypography({
          i = '', baseTypeName, wrapper,
          baseClassName = baseTypeName.toLowerCase(),
          baseTagName = baseClassName[0],
          tagName = `${baseTagName}${i}`,
          className = `${baseClassName}${i}`,
          typeName = baseTypeName + i,
          defaultText = `${baseTypeName} ${i}`,
          specifiedProperties = {text: "some text"},
          modelProperties = specifiedProperties
        }) {
          function html(text) {
            let main = `<${tagName} class="mdc-typography--${className}">${text}</${tagName}>`;
            if (wrapper) return `<${wrapper}>${main}</${wrapper}>`;
            return main;
          }
          let defaultHTML = html(defaultText),
              specifiedHTML = html(specifiedProperties.text),
              modeledHTML = html(modelProperties.text);
          testComponent({typeName, defaultHTML, specifiedHTML, modeledHTML, modelProperties, specifiedProperties});
        }
        for (let i = 1; i <= 6; i++) {            
          testTypography({i, baseTypeName: 'Headline'});
        }
        for (let i = 1; i <= 2; i++) {
          testTypography({i, baseTypeName: 'Subtitle', tagName: 'h6'});
        }
        for (let i = 1; i <= 2; i++) {
          testTypography({i, baseTypeName: 'Body', tagName: 'p'});
        }
        ['button', 'caption', 'overline'].forEach(baseClassName => {
          let upper = baseClassName[0].toUpperCase() + baseClassName.slice(1),
              baseTypeName = `${upper}Text`,
              defaultText = `${upper} Text`;
          testTypography({baseClassName, baseTypeName, defaultText, tagName:'span', wrapper:'div'});
        });
      });
      describe('Progress', function () {
        function linearProgressHTML(label = "Progress Bar", value = 0.33) {
          return `
<div class="mdc-linear-progress mdc-linear-progress--animation-ready" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${value}">
  <div class="mdc-linear-progress__buffer">
    <div class="mdc-linear-progress__buffer-bar"></div>
    <div class="mdc-linear-progress__buffer-dots"></div>
  </div>
  <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
    <span class="mdc-linear-progress__bar-inner"></span>
  </div>
  <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
    <span class="mdc-linear-progress__bar-inner"></span>
  </div>
</div>`;
        }
        testComponent({
          typeName: 'LinearProgress',
          defaultHTML: linearProgressHTML(),
          specifiedProperties: null,
          modelProperties: null
        });

        /*
        function circularProgressHTML(label = "Progress Bar", value = 0.5) {
          return `
<div class="mdc-circular-progress" role="progressbar" aria-label="Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0.33">
  <div class="mdc-circular-progress__determinate-container">
    <svg class="mdc-circular-progress__determinate-circle-graphic" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"></circle>
      <circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-width="4" stroke-dasharray="113.097" stroke-dashoffset="113.097"></circle>
    </svg>
  </div>
  <div class="mdc-circular-progress__indeterminate-container">
    <div class="mdc-circular-progress__spinner-layer">
      <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke-width="4" stroke-dasharray="113.097" stroke-dashoffset="56.549"></circle>
        </svg>
      </div>
      <div class="mdc-circular-progress__gap-patch">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke-width="3.2" stroke-dasharray="113.097" stroke-dashoffset="56.549"></circle>
        </svg>
      </div>
      <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke-width="4" stroke-dasharray="113.097" stroke-dashoffset="56.549"></circle>
        </svg>
      </div>
    </div>
  </div>
</div>`;
        }
        testComponent({
          typeName: 'CircularProgress',
          defaultHTML: circularProgressHTML(),
          specifiedProperties: null,
          modelProperties: null
        });*/

      });
    });

    describe('button', function () {
      // Invoking a specific action.
      
      function iconButtonHTML(text, {formatting = '', attributes = '', baseClass = 'button'}) {
        return `
<button class="mdc-${baseClass}${formatting}"${attributes}>
  <span class="mdc-${baseClass}__ripple"></span>${text}
</button>`;
      }
      testComponent({
        typeName: 'IconButton',
        defaultHTML: iconButtonHTML('favorite', {baseClass: 'icon-button', formatting: ' material-icons mdc-ripple-upgraded--unbounded mdc-ripple-upgraded'}),
        specifiedProperties: {text: 'bookmark'},
        specifiedHTML: iconButtonHTML('bookmark', {baseClass: 'icon-button', formatting: ' material-icons mdc-ripple-upgraded--unbounded mdc-ripple-upgraded'}),
        modelProperties: null
      });

      function iconButtonToggleHTML(iconOn, iconOff, labelOn, labelOff) {
        return `
<button class="mdc-icon-button mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" aria-label="${labelOff}" data-aria-label-off="${labelOff}" data-aria-label-on="${labelOn}">
  <div class="mdc-icon-button__ripple"></div>
  <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">${iconOn}</i>
  <i class="material-icons mdc-icon-button__icon">${iconOff}</i>
</button>`;
      }
      testComponent({
        typeName: 'IconButtonToggle',
        defaultHTML: iconButtonToggleHTML('favorite', 'favorite_border', "Remove from favorites", "Add to favorites"),
        specifiedProperties: {labelOn: 'do it', labelOff: 'stop it', iconOn: 'bookmark', iconOff: 'bookmark_border'},
        specifiedHTML: iconButtonToggleHTML('bookmark', 'bookmark_border', "do it", "stop it"),
        modelProperties: null
      });
      
      function buttonHTML(text, formatting = '', icon = '', attributes='') {
        let iconSpan = !icon ? '' : `<i class="material-icons mdc-button__icon" aria-hidden="">${icon}</i>`;
        // The mdc-ripple-upgraded is something that gets added when the implementation calls MDCRipple.attachTo().
        return iconButtonHTML(`${iconSpan}<span class="mdc-button__label">${text}</span>`,
                              {formatting: formatting + ' mdc-ripple-upgraded', attributes: attributes + ' ontouchstart=""'});
      }
      testComponent({
        typeName: 'Button',
        defaultHTML: buttonHTML('Button'),
        specifiedProperties: {text: 'Push Me', variant: 'outlined', icon: 'favorite', disabled: true},
        specifiedHTML: buttonHTML('Push Me', ' mdc-button--outlined mdc-button--icon-leading', 'favorite', ' disabled=""'),
        modeledHTML: buttonHTML('Push Me')
      });

      function fabHTML(icon) {
        return `
<button class="mdc-fab mdc-ripple-upgraded" aria-label="${icon}">
  <div class="mdc-fab__ripple"></div>
  <span class="mdc-fab__icon material-icons">${icon}</span>
</button>`;
      }
      testComponent({
        typeName: 'FAB',
        defaultHTML: fabHTML('favorite'),
        specifiedProperties: null,
        modelProperties: null
      });
    });

    describe('input', function () {
      describe('boolean', function () {

        function checkboxHTML(label) {
          let display = `
   <div class="mdc-checkbox mdc-checkbox--upgraded mdc-ripple-upgraded mdc-ripple-upgraded--unbounded">
    <input class="mdc-checkbox__native-control" type="checkbox" id="checkbox-1">
    <div class="mdc-checkbox__background">
      <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
        <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
      </svg>
      <div class="mdc-checkbox__mixedmark"></div>
    </div>
    <div class="mdc-checkbox__ripple"></div>
  </div>`;
          if (!label) return display;
          return `
  <div class="mdc-form-field">
    ${display}
    <label for="checkbox-1">${label}</label>
  </div>`;
        }
        testComponent({
          typeName: 'Checkbox',
          defaultHTML: checkboxHTML('checkbox'),
          specifiedProperties: {label: ''},
          specifiedHTML: checkboxHTML(''),
          modelProperties: null});

        function radioHTML(label, name) {
          let display = `
   <div class="mdc-radio mdc-ripple-upgraded mdc-ripple-upgraded--unbounded">
    <input class="mdc-radio__native-control" type="radio" id="radio-1" name="${name}">
    <div class="mdc-radio__background">
      <div class="mdc-radio__outer-circle"></div>
      <div class="mdc-radio__inner-circle"></div>
    </div>
    <div class="mdc-radio__ripple"></div>
  </div>`;
          if (!label) return display;
          return `
  <div class="mdc-form-field">
    ${display}
    <label for="radio-1">${label}</label>
  </div>`;
        }
        testComponent({
          typeName: 'Radio',
          defaultHTML: radioHTML('radio', 'radio'),
          specifiedProperties: {label: '', name: 'foo'},
          specifiedHTML: radioHTML('', 'foo'),
          modelProperties: null});
        

        function switchHTML(text) {
          let body = `
<div class="mdc-switch">
  <div class="mdc-switch__track"></div>
  <div class="mdc-switch__thumb-underlay mdc-switch__ripple mdc-ripple-upgraded mdc-ripple-upgraded--unbounded">
    <div class="mdc-switch__thumb">
      <input class="mdc-switch__native-control" type="checkbox" id="T1" role="switch" aria-checked="false">
    </div>
  </div>
</div>`;
          if (!text) return body;
          return `<span>${body} <label for="t1">${text}</label></span>`;
        }
        testComponent({
          typeName: 'Switch',
          defaultHTML: switchHTML('off/on'),
          specifiedProperties: {text: ''},
          specifiedHTML: switchHTML(''),
          modelProperties: null
        });          
      });

      function textFieldHTML(text) {
        let base = `
<label class="mdc-text-field mdc-text-field--filled mdc-ripple-upgraded">
  <span class="mdc-text-field__ripple"></span>
  <span class="mdc-floating-label" id="my-label-id">${text}</span>
  <input class="mdc-text-field__input" type="text" aria-labelledby="my-label-id">
  <span class="mdc-line-ripple"></span>
</label>`;
        return base;
      }
      testComponent({
        typeName: 'TextField',
        defaultHTML: textFieldHTML("Hint text"),
        specifiedProperties: null,
        modelProperties: null
      });
      
      describe('Slider', function () {
        //fixme
      });
    });  });

  describe('surface', function () {
    // General displays of composite content for specific contexts.
    describe('Tooltips', function () {
    });
    describe('Snackbar', function () {
    });
    describe('Banner', function () {
    });
    describe('Dialog', function () {
    });
    describe('AppBar', function () {
    });
    describe('Card', function () {
    });
  });

  describe('structured surface', function () {
    // Arrangement or layout of some sort of repeating item.
    function gridHTML(n, genCell) {
      // TBD: There are optional CSS classes and some  CSS custom style properties that can be specified.
      // https://material.io/develop/web/supporting/layout-grid
      // How should javascript specify these for a portion of the tree, and how will we test that?
      //
      // FIXME: The current code and test adds mdc-layout-grid__cell  to each child.display. It might be safer
      // (but currently harder) to instead wrap each child in <div class="mdc-layout-grid__cell">.
      let inner = '';
      for (let i=0; i<n; i++) {
        inner += genCell(i);
      }
      return `
<div class="mdc-layout-grid">
  <div class="mdc-layout-grid__inner">${inner}</div>
</div>`;
    }
    testComponent({
      typeName: 'Grid',
      defaultHTML: gridHTML(3, i => `<p class="mdc-typography--body1 mdc-layout-grid__cell">Grid Cell ${i}</p>`),
      specifiedProperties: {mirrors: [new MDC.Body2({text: 'foo'})]},
      specifiedHTML: gridHTML(1, i => `<p class="mdc-typography--body2 mdc-layout-grid__cell">foo</p>`),
      // FIXME: Hook mirrorClass into a view creator that makes the correct view class for the children of a model based on [[what??]],
      // and then make an example here.
      // FIXME: create a nested grid, which should NOT make a new <div class="mdc-layout-grid"> around the inner grid.
      modelProperties: {},
      modeledHTML: gridHTML(0)
    });
    describe('List', function () {
    });
    describe('ImageList', function () {
    });
    describe('Chip', function () {
        //fixme
      });
    describe('DataTable', function () {
    });
    describe('Menu', function () {
    });
    describe('Drawer', function () {
    });
    describe('Tab', function () {
    });
  });
});
