# botto.js
botto.js is a simple script designed by Bottomatik to allow you to simply 
integrate front-end plugins to your site.

These plugins include Facebook Optins (send-to-messenger button and checkbox) and will include 
Bottomatik's webchat in the future.

## Facebook

Facebook plugins include Checkbox and Send-to-messenger button.

Note that the **checkbox** plugin needs the triggering of a button or element (click, tap...) and **MUST NOT**
be triggered directly by a script (outside an event).

### Flow
0) Create your HTML divs with the classes needed (more on this below).
1) Because of different facebook needs, you must first initialize the script.
2) Once inited, you can simply call the functions used to create the items
3) [optional] When the user clicks a button, call the corresponding trigger.

### Facebook initialization
```javascript
botto.facebook.init(system, [host])
```
Returns a **Promise**.

| Name | Required | Type | Description |
|:----:|:--------:|:----:|:-----------:|
| system| true | String | The system used by Bottomatik. Ex: `'imagnarium'` |
| host | false | String | The host to tap if not using prod version. Always in HTTPS. Ex: `'2873468.ngrok.com'` |

### Send to Messenger - OPTIN

#### HMTL
In order to create the Messenger *Send-to-Messenger* button you only need to insert this HTML and leave it empty
```html
<div class="botto-fb-button"></div>
```

You can apply any CSS you want, but keep in mind that Facebook resizes the button according to your preferences.



#### JavaScript
```javascript
botto.facebook.button(reference, options);
```
Creates a Facebook Button if a div with class `botto-fb-button` is found.

| Name | Required | Type | Description |
|:----:|:--------:|:----:|:-----------:|
| reference| true | String | The reference to send to Bottomatik. This will allow you to keep track of different buttons, and send different messages|
| options | false | Object | The different options to create the facebook button |

###### Options
| Name | Value |
|:----:|:--------:|
| color| `'white'` or `'blue'`|
| size | `standard` or `large` or `xlarge`|

### Messenger Checkbox - OPTIN

#### HMTL
In order to create the Messenger *Checkbox* plugin you only need to insert this HTML and leave it empty
```html
<div class="botto-fb-checkbox"></div>
```

You can apply any CSS you want, but keep in mind that Facebook resizes the button according to your preferences.



#### JavaScript
```javascript
botto.facebook.button(user_ref, options);
```
Creates a Facebook Button if a div with class `botto-fb-button` is found.

| Name | Required | Type | Description |
|:----:|:--------:|:----:|:-----------:|
| `user_ref`| true | String | The reference to use for a unique user. Keep in mind that if the reference has already been used, the checkbox will not display|
| `options` | false | Object | The different options to create the facebook button |

**Note**: *`user_ref` must be unique, even for the same returning user*

###### Options
| Name | Value |
|:----:|:--------:|
| `prechecked`| `true` or `false`|
| `size` | `small` or `medium` or `large` or `standard` or `xlarge`|
| `allow_login` | `true` or `false`|

###### Events

```javascript
botto.facebook.checked(reference, user_ref);
```

**Note**: * Trigger ONLY from a user generated event.

`reference` and `user_ref` are used the same way as before. `user_ref` must be the same than the one used to create the checkbox, and reference 
is used the same way than on the `send-to-messenger` plugin.

### Full Example
```javascript
// initializing with my own system
botto.facebook.init('my_super_website').then(e => {
	// create button with reference
    botto.facebook.button('home_page_ref', {color: 'blue'});

    // create checkbox with user reference
    botto.facebook.checkbox('user_1');

    // use fb.ready to indicate that the 
    // facebook initialization went well
	botto.facebook.ready();

}).catch(e => {
    console.error('[Botto][FB]', e);
});

document.querySelector('#submit').addEventListener('click', function(e){
	// prevent default if needed
	e.preventDefault();

	// use user-triggered event to trigger checkbox event
	// note that the user_ref is the same than on the checkbox
	botto.facebook.checked('mail_signup_ref', 'user_1');
});
```