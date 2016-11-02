# base-project

## Specifications

- Based on Jade, Gulp, Node and Sass
- Create new pages based on layouts. Fill it with components
- 17 Layouts by defaults
- 10 Components by default
- Easy Maintenance
- HTML Code generalized thanks to Jade.
- General Structure for components
- Customize styles
- Based on Bootstrap 
- Optimized for SEo and Web Accesibility
- CSS and JS Compress
- Images Optimized
- Js Tablet and Mobile optimized

## Installation

Run npm install on project folder to launch de installation of all modules required.


## Running Project

Run command gulp on your console to start the server. This task run all the task defined as default

## Aditional gulp services

### Gulp Connect

> gulp connect

Start the server on localhost:8080. It's included con default Task.

### Gulp HTML

> gulp html

Compile jade files from src/jade folder. It's included con default Task.

### Gulp Styles

> gulp Styles

Compile scss and css file imported form src/sass/main.scss in one minified css file. It's included con default Task.

### Gulp cssComponents

> gulp cssComponents

Compile scss and css of the jade components in one minified css file. It's included con default Task.

### Gulp Fonts

> gulp fonts

Publish all files from /src/fonts to public/fonts/. It's included con default Task.

### Gulp CompressJS

> gulp compressJS

Compress javascript files in src/javascript into one compress javascript file and send it to public/js. It's included con default Task.

### Gulp Images

> gulp images

Publish all files from src/images to public/images and compress them. It's included con default Task.

## Using the enviroment

Base Project provide a front dev enviroment that include a page generation engine very intuitive based on a layer model where the page generation is generelized facilitating the creation, not only of new pages,  but layouts , components and new styles.

### Pages

If you want to create a new page you just have to duplicate our sample page and rename it. Then, you have to select the layout you want to use( extends layouts/layout-12-8-4 ), base project provide you many layouts you can use o you can create new ones. Last thing you have to do is fill the differents columns with de compontents that you want.

### Layouts

Base project provide you many precreated layouts based on bootstrap markup but you can create all you want. 

By Default you cant use:

- layout-3-9
- layout-12-3-9
- layout-12-3-9-12
- layout-9-3
- layout-12-9-3
- layout-12-9-3-12
- layout-8-4
- layout-12-8-4
- layout-12-8-4-12
- layout-4-8
- layout-12-4-8
- layout-12-4-8-12
- layout-6-6
- layout-12-6-6
- layout-12-6-6-12
- layout-12
- layout-12-fluid

if you want to make your own layouts, duplicate one, rename it and change the html markup.

### Components

You can use the components provided by the system or you can create all components you want. 

#### Using components

When you create a new page you have to fill the columns of the layout with components. You have to use the mixin created on jade to import a component using the structure defined to it:

> +component(componentType,ID,content,componentTitle,showTitle, fullDisplay)

- componentType: [string][required] The name of the component you want to use(component-breadcrumbs, component-language, etc...).
- ID: [string] if you want you give a ID to the component. This ID has to be unique.
- content: If you have to send information to the component you can use this parameter. You can send a JSON, Object, Boolean, etc...
- componentTitle: [string] If you want to give a custom title text you can. Use this parameter and enable in showTitle parameter.
- showTitle:[boolean]. If true this show the component title defined in componentTitle parameter. Default 'true'.
- fullDisplay:[boolean]. If true the component will show without default paddings and borders. Default 'false'.

##### EXAMPLES

> +component('component-sample-basics','id3','','Sample Component Basics')

> +component('component-breadcrumbs','id2',[{'pageName':'Pagina1','url':'/pagina1.html'},{'pageName':'Pagina2','url':'/pagina2.html'},{'pageName':'Pagina3','url':'/pagina3.html'}],'','false','true')

> +component('component-banner','id8',{'src':'/public/images/image1.jpg','alt':'description','href':'./pagina1.html','title':'Ir a la pagina 1'},'','false','true')

#### Creating new components

If you want to create a new one, you can duplicate an exiting component and rename it. You have 3 files on your component folder: component-name.jade, main.css and main.js

Also, you have to include your new component on src/jade/templates/include_components.jade. When you defined it, you will can use it on pages.

We do not recommend to add css or js in this files but if you want you can do it. We recommend that all css and JS must be allocated in src/javascript and src/sass. All js and css components files will compile in a one css and js files called components.css and components.js

Finally, in component-name.jade you have to change the mixin name to your component name and custom the content with de content you want, static or dynamic.

### CSS

Base project provide a css base based on bootstrap that you can use or define your own.

Only the css files imported con main.scss will be included on the compiled project.

### Javascript

Base project include jQuery 1.12.4 by default. Files allocated on src/javascript/primaryLibs will be the first compiled, the next one will be the lib folder and, the last one will be the rest. This method, allow you to control the order of the compilation. 

All this files will be compile in one called main.min.js

If you put a '_' at the beginning of the javascript file name, this file will be ignored on the compilation(example: _tablet.js)

There are 2 special files: mobile.js and tablet.js. By default, they are disabled by _ buy you can enable it if you want to use it. This file allow you to launch special scripts only on tablet or mobile, and disable them when you resize between desktop, mobile and tablets or turn your device. You do not have to change the original structure, just extend it, create new functions and call them from enableMobileJS() and disableMobileJS(). 



