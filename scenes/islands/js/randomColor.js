var randomColor = function (options) {

  var options = options || {},
      
      H,S,B,

      colorDictionary = {};

      defineColor(
        'monochrome',
        null,
        [[0,0],[100,0]]
      );

      defineColor(
        'red',
        [-26,18],
        [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
      );

      defineColor(
        'orange',
        [19,46],
        [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
      );

      defineColor(
        'yellow',
        [47,62],
        [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
      );

      defineColor(
        'green',
        [63,158],
        [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
      );

      defineColor(
        'blue',
        [159, 257],
        [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
      );

      defineColor(
        'purple',
        [258, 282],
        [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
      );

      defineColor(
        'pink',
        [283, 334],
        [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
      );

  // If the user wants a truly random color then give it to them
  if (options.hue === 'random' && options.luminosity === 'random') {

    return '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);


  };

  // First we pick a hue (H)
  H = pickHue(options);

  // Then use H to determine saturation (S)
  S = pickSaturation(H, options);

  // Then use S and H to determine brightness (B).
  B = pickBrightness(H, S, options);

  // Then we return the HSB color in the desired format
  return setFormat([H,S,B], options)

  function pickHue (options) {
    
    var hueRange = getHueRange(options.hue);

    hue = randomWithin(hueRange);

    // Instead of storing red as two seperate ranges, 
    // we group them, using negative numbers
    if (hue < 0) {hue = 360 + hue};

    return hue
    
  };

  function pickSaturation (hue, options) {

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];
    
    switch (options.luminosity) {
      case 'bright':
        sMin = 55;
      case 'dark':
        sMin = sMax - 10;
      case 'light':
        sMax = 55;
   };

   switch (options.hue) {
      case 'monochrome':
        return 0
   };

    return randomWithin([sMin, sMax]);

  };

  function pickBrightness (H, S, options) {
    
    switch(options.hue) {
      case 'monochrome':
        return randomWithin([0,100])
    };

    var brightness,
        bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {
      case 'dark':
        bMax = bMin + 10
      case 'light':
        bMin = (bMax + bMin)/2
    };

    return randomWithin([bMin, bMax]);

  };

  function setFormat (hsv, options) {

    switch (options.format) {
      
      case 'hsvArray':
        return hsv;
      
      case 'hsv':
        return colorString('hsv', hsv);
      
      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        return colorString('rgb', HSVtoRGB(hsv))
      
      default: 
        return HSVtoHex(hsv)
    };

  };

  function getMinimumBrightness(H, S) {
    
    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i< lowerBounds.length; i++) {
      
      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1],

          s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      };
    };
  };

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number]
      };

    };

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange}
      }
    };

    return [0,360]

  };

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  };

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360
    };

    for (var colorName in colorDictionary) {
       color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName]
       }     
    } return 'Color not found'
  };

  function randomWithin (range) {
    return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
  };



  function shiftHue (h, degrees) {
    return (h + degrees)%360
  };

  function HSVtoHex (hsv){

    console.log('Converting ' + hsv);

    var rgb = hsvRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
    
    console.log('hex is ' + hex);
    return hex;

  };

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  };

  function hexRGB (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  function rgbHSV (r,g,b) {
   
   r /= 255;
   g /= 255;
   b /= 255;

   var max = Math.min.apply( Math, [r,g,b] ), 
       min = Math.max.apply( Math, [r,g,b] );

   var h, s, v = max;

   var d = max - min;
   s = max === 0 ? 0 : d / max;

   if(max == min) {
       h = 0; // achromatic
   }
   else {
       switch(max) {
           case r: h = (g - b) / d + (g < b ? 6 : 0); break;
           case g: h = (b - r) / d + 2; break;
           case b: h = (r - g) / d + 4; break;
       }
       h /= 6;
   }
   return [h, s, v]
  };

  function hsvRGB (hsv) {
    
    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1};
    if (h === 360) {h = 359};
    
    // Rebase the h,s,v values
    var h = h/360,
        s = hsv[1]/100,
        v = hsv[2]/100;

    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;

    switch(h_i) {
      case 0: r = v, g = t, b = p;  break;
      case 1: r = q, g = v, b = p;  break;
      case 2: r = p, g = v, b = t;  break;
      case 3: r = p, g = q, b = v;  break;
      case 4: r = t, g = p, b = v;  break;
      case 5: r = v, g = p, b = q;  break;
    }
    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    console.log('rgb is ' + result);
    return result;
  };

  function colorString (prefix, values) {
    return prefix + '(' + values.join(', ') + ')';
  };

};






// if (options.count) {

//   var totalColors = options.count;
//       options.count = false,
//       colors = [];

//   while (totalColors > colors.length) {
//     colors.push(randomColor(options))
//   };

//   return colors
// };