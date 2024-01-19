# Shadow-Boxing.js
A small (~100LOC) module/library for enabling a page's styles to
influence the (open) Shadow DOM defaults. 

It supports numerous 'modes' for exploring different kinds of "open stylable Shadow Roots".

You choose the mode by setting the `shadow-style-mode` on the root HTML element. For example, the simplest:

```
<html shadow-style-mode="page-push">
  <!-- 
   All of the stylesheets (initially) in the head 
   affect will affect all shadow trees automatically now 
  -->
  <head>
    <link href="..." rel="stylesheet"></link>
    <style>...</style>
    <script src="/shadow-boxing.js"></script>
    ...
```

There are currently 6 "modes", but really they are mostly permutations of a few basic ideas: "all" vs "marked" and "page-push" vs "component-pull".  

* [Modes explained](#modes-explained)
* [Get started](#get-started)
* [Modes reference table](#modes-reference-table)
* [Notes](#notes)


## Modes explained
### all vs *-marked 

3 of the 6 modes end in `-marked`.  This simply directs that rather than adding all of the styesheets from the head into each Shadow DOM, only add those marked with the `shadow-import` attribute.  For example, compare this with the previous...


```
<html shadow-style-mode="page-push-marked">
  <head>
    <style>/* These won't apply */</style>
    <style shadow-import>/* These will apply */</style>
    <script src="/shadow-boxing.js"></script>
    ...

```


### page-push-select-*

Just as there is a `page-push` and a `page-push-marked` there is a `page-push-select` and `page-push-select-marked`.  The major difference between these is that the `-select-` family relies on the page author to "select" which elements should have stylesheets injected into them, by adding a `shadow-style-select` to them, like so...


```
<html shadow-style-mode="page-push-select-marked">
  <head>
    <style>/* These won't apply */</style>
    <style shadow-import>/* These will apply */</style>
    <script src="/shadow-boxing.js"></script>
    ...
  </head>
  <body>
     <x-foo><!-- Doesn't apply to Shadow DOMs by default --></x-foo>
     <x-bar shadow-style-select><!-- applies to this Shadow DOM --></x-bar>
     <x-foo><!-- Not this one --></x-foo>
     <x-blip shadow-style-select><!-- Yup, this one... --></x-blip>
     ...
```



### component-pull-*

Similarly there is a `component-pull` and a `component-pull-marked`. The big difference here is that this operates under the philosophy that it is the component's job to actually opt into this behavior by subclassing a special `OpenStyleable` class, which actually does the work.



 
```
<html shadow-style-mode="component-pull-marked">
  <head>
    <style>/* These won't apply */</style>
    <style shadow-import>/* These will apply */</style>
    <script src="/shadow-boxing.js"></script>
    ...
  </head>
  <body>
     <!-- Will only apply to elements which extended the `OpenStylable` class -->
     <x-foo><!-- maybe? --></x-foo>
     ...
```

The component pull model is also inherently limited to use on Custom Elements and cannot be used to style a Shadow DOM on any  native element.




## Modes reference table

The optional modes can be set as

| code       | explanation |
|-----------------------------------------------|---------------:|
| `<html shadow-style-mode="page-push">`        | All of the stylesheets in the head affect shadow trees automatically |
| `<html shadow-style-mode="page-push-marked">` | Stylesheets in the head,  marked with the boolean `shadow-import` attribute affect shadow trees |
| `<html shadow-style-mode="page-push-select">` | All of the stylesheets in the head affect shadow trees on host elements which have a `shadow-style-select` attribute on them |
| `<html shadow-style-mode="page-push-select-marked">` | Stylesheets in the head,  marked with the boolean `shadow-import` attribute affect shadow trees on host elements which have a `shadow-style-select` attribute on them |
| `<html shadow-style-mode="component-pull">`        |  All of the stylesheets in the head are pulled down by, and affect shadow trees **of elements that extend `OpenStyleable`** (provided by the library) automatically |
| `<html shadow-style-mode="component-pull-marked">` |  All of the stylesheets in the head and marked with the boolean `shadow-import` attribute are pulled down by and affect shadow trees **of elements that extend `OpenStyleable`** (provided by the library) |


The optional modes are of two main philosophies `page-push` and `component-pull`. The former pushes from the page into all shadow roots. 

The later requires elements that want to accept styles from the outer page subclass a particular base class which causes those components to 'pull' styles into the component.

`page-push` has a variant called `page-push-select` which allows the _page_  (not component authors) to select specifically which elements styles are pushed into.

## Get started

To get started, [grab the script](/shadow-boxing.js) 
and include it in your page.

```html
  <script src="/shadow-boxing.js"></script>
```

Add the `shadow-style-mode` attribute to the `<html>` element with your value of choice from the table above.

If that value is one of the `-marked` variants, choose which stylesheet(s) you'd like to apply to shadow roots and mark those `<link>` or `<style>` elements with the `shadow-import` attribute.

If the value is one of the `select` variants, choose which elements you'd like to specificaly inject styles into and mark those elements with the `shadow-style-select` attribute.

### Notes:

* Doesn't currently work with Declarative Shadow DOM
* Changes to any of the the mode attribute has no effect, but the head is monitored for changes to styles and updated live
* Marked versions will be more efficient, and less prone to accidental matches
* Nothing about selector _matching_ changes. `button { ... }` will match in all roots, but `.foo button { ... }` will only match in the same root.
* Sheets are seen as before other styles in the Shadow Roots, in original document order.  Thus, anything specified by the component wins either way, barring some use of `!important`


This is a work heavily inspired by Nolan Lawson's original [Open Stylable NPM Package](https://www.npmjs.com/package/open-stylable) which is, effectively the key implementation parts of the `pull-page` version. 

For uses of the `component-pull-*` modes, all of the documentation in [Nolan's README](https://github.com/nolanlawson/open-stylable/blob/master/README.md) applies here too, except that by default there is no module export (there is a version ending in -module.js included here as well though if you prefer). Really the main thing this adds to Nolan's is simply that it requires an attribute on the HTML which is useful for us as a thing to find in the wild for study.
