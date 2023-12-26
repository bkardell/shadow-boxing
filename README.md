# Shadow-Boxing.js
A small (<100LOC) module/library for enabling a page's styles to
influence the (open) Shadow DOM defaults. 

It supports several "modes". A page may specify one via an attribute on the `<html>` element
`shadow-style-mode`.  Changing the attribute after the fact has no effect.  

The optional modes can be set as

| code       | explanation |
|-----------------------------------------------|---------------:|
| `<html shadow-style-mode="page-push">`        | All of the stylesheets in the head affect shadow trees automatically |
| `<html shadow-style-mode="page-push-marked">` | Stylesheets in the head,  marked with the boolean `shadow-import` attribute affect shadow trees |
| `<html shadow-style-mode="component-pull">`        |  All of the stylesheets in the head are pulled down by, and affect shadow trees **of elements that extend `OpenStyleableElement`** (exported by this module) automatically |
| `<html shadow-style-mode="component-pull-marked">` |  All of the stylesheets in the head and marked with the boolean `shadow-import` attribute are pulled down by and affect shadow trees **of elements that extend `OpenStyleableElement`** (exported by this module) |


The optional modes are of two main philosophies `page-push` and `component-pull`. The former pushes from the page into all shadow roots. 
The later requires elements that want to accept styles from the outer page subclass a particular base class which causes those components to 'pull' styles into the component.


## Get started

To get started, [grab the module](/shadow-boxing.js) 
and include it in your page.

```html
  <script src="/shadow-boxing.js" type="module"></script>
```

Add the `shadow-style-mode` attribute to the `<html>` element with your value of choice from the table above.

If that value is one of the `-marked` variants, choose which stylesheet(s) you'd like to apply to shadow roots

### Notes:

* Changes to any of the the mode attribute has no effect, but the head is monitored for changes to styles and updated live
* Marked versions will be more efficient, and less prone to accidental matches
* Nothing about selector _matching_ changes. `button { ... }` will match in all roots, but `.foo button { ... }` will only match in the same root.
* Sheets are seen as before other styles in the Shadow Roots, in original document order.  Thus, anything specified by the component wins either way, barring some use of `!important`


This is a work heavily inspired by Nolan Lawson's original [Open Stylable NPM Package](https://www.npmjs.com/package/open-stylable) which is, effectively the key implementation parts of the `pull-page` version. 

For uses of those modes, all of the documentation in [Nolan's README](https://github.com/nolanlawson/open-stylable/blob/master/README.md) applies heretoo, except that the baseclass is `OpenStyleableElement` here, rather than just `OpenStylable`.
