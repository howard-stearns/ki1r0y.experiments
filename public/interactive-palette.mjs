
/*
  - An item can be displayed in multiple views simultaneously, so the view MUST have a parent/child relationship separate from that of the referenced object.
  - A view has an entity object that it is displaying itself for, and which events typically act on.
    Having a null entity (rather than circularly being itself) means the view is acting as as a first class entity, rather than a view of something else.
*/
import "./@kilroy-code/rules/spec/spec.mjs";
import "./spec/registerableSpec.mjs"; // FIXME: rename these mumbleSpec (and see if we can loose the .mjs)
import "./spec/treeSpec.mjs";
import "./spec/entity.mjs";
import "./spec/displayControllerSpec.mjs";
//import "./spec/mdc.mjs";

import Tree from './tree.mjs';
/*
import { Div, Document } from './dom.mjs';
import { Headline1, Headline2, Headline3, Headline4, Headline5, Headline6, Subtitle1, Subtitle2, Body1, Body2,
         Typography, LinearProgress, CircularProgress,
         Button, IconButton, IconButtonToggle, FAB,
         Checkbox, Radio, Switch,
         TextField,
         Grid, List, Menu, AppBar
       } from './mdc.mjs';

const data = new Tree({specs: [
  {text: "first item"},
  {text: "second item", specs: [
    {text: "second item first subitem"},
    {text: "second item second subitem", specs: [
      {text: "second item second subitem first sub-subitem"},
      {text: "second item second subitem second sub-subitem"},
      {text: "second item second subitem third sub-subitem"}
    ]},
    {text: "second item third subitem"} 
  ]},
  {text: "third item"}
]});

Document.body = new Document({
  elementFormatting: 'mdc-typography', // FIXME: arrange for this by default.
  parts: [
    // new AppBar({text: 'Page Title', specs: [
    //   // FIXME: can these be normal Buttons?
    //   {text: 'favorite', type: 'Div', elementTag: 'button', elementFormatting: 'material-icons mdc-top-app-bar__action-item mdc-icon-button'},
    //   {text: 'search', type: 'Div', elementTag: 'button', elementFormatting: 'material-icons mdc-top-app-bar__action-item mdc-icon-button'},
    //   {text: 'more_vert', type: 'Div', elementTag: 'button', elementFormatting: 'material-icons mdc-top-app-bar__action-item mdc-icon-button'}
    // ]}),
    new Div({elementTag: 'main', elementFormat: 'mdc-top-app-bar--fixed-adjust', parts: [
      new Grid({parts: [
        new Button(),
        new IconButton(),
        new IconButtonToggle(),
        new FAB(),
        new Checkbox(),
        new Div({parts: [new Radio({label: 'radio 1'}), new Radio({label: 'radio 2'})]}),
        new Switch(),
        new TextField({text: 'Hint text'}),
        new LinearProgress(),
        new CircularProgress(),        
        // card
        // checkbox
        // chips
        // data table
        // dialog
        // drawer
        // icon button
        // image list
        // layout (nested)
        new List({groupFormatting: 'mdc-list', specs: [{text: "Line item 1"}, {text: "Line item 2"}, {text: "Line item 3"}]}),
        new Div({elementFormatting: 'mdc-menu-surface--anchor', specs: [
          {type: 'Button', text: "open", events: {onclick: function (event) {  this.parent.parts[1].menu.open = true; }}},
          {type: 'Menu', specs: [
            {type: 'List', groupFormatting: 'mdc-list', specs: [
              {text: 'A menu item'},
              {text: 'Another menu item'}
            ]}
          ]}
        ]}),
        // radio
        // ripple ??
        // select
        // slider
        // snackbar
        // tab bar
        // top app bar
        new Div({parts: [
          new Headline4({text: "headline 4"}),
          new Subtitle1({text: "subtitle 1"}),
          new Body1({text: "body 1. The quick brown fox jumps over the lazy dog."})
        ]}),
        new List({model: data})
      ]})
    ]})
  ]});
window.Document = Document;
*/
window.Tree = Tree;
