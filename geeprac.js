// print('hi');

// // var num = ee.Number(2)
// // var lss = ee.List([2,4,6])

// // var x = [2,4,5,6, 'st']
// // print(typeof(num))

// // print(lss.get(2))
// var lst = []
// for (var i =0;i<10;i++){
//   lst.push(i)
// }
// print(lst)

// var x =ee.List.sequence(0,100,2)
// print(x)

// var ar = ee.Array([1,2,3])

// print(ar.length())

print()
//////////////////////////


var object = {
  foo: 'bar',
  baz: 13,
  stuff: ['this', 'that', 'the other thing']
};
print('Dictionary:', object['stuff'][0]);

 var fun =function (para){
  var sq = ee.Number(para).pow(2);
  return sq
}
var lst = ee.List.sequence(2,10);

// // print(lst.map(fun));

// country data//

//   var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
//   .filter(ee.Filter.eq('ADM0_NAME', 'Bangladesh'));  // country shp
  
  
//   var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
//   .filter(ee.Filter.eq('ADM1_NAME', 'Dhaka')); 
  
//   var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
//   .filter(ee.Filter.eq('ADM2_NAME', 'Netrakona')); 
//   var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
//   .filter(ee.Filter.inList('ADM1_NAME', ['Dhaka','Khulna'])).union()
  
//   var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
//   .filter(ee.Filter.inList('ADM1_NAME', ['Dhaka','Khulna'])).geometry().dissolve()



// var roi=roi.filter(ee.Filter.eq('NAME_2','Tangail' ));
// print(roi);


var bd = world.filter(ee.Filter.inList('ADM1_NAME', ['Dhaka','Khulna']));
// Map.addLayer(bd, {color: 'blue'}, "BD", false, 1);


Map.setCenter(89.28160255159058,24.35513806963132, 6);

// var ar = gm.area();
// print(ar.divide(1000000));

// var un = gm.intersection(gm2)
// Map.addLayer(un)

print(gm2.get('area'))

            // using code
            
            
var polygon = ee.Geometry.Polygon([
  [[-35, -10], [35, -10], [35, 10], [-35, 10], [-35, -10]]
]);

// Create a Feature from the Geometry.
var polyFeature = ee.Feature(polygon, {area: 42, union: 'x'});

print( 'polyf',polyFeature)

var feature = ee.Feature(ee.Geometry.Point([-122.22599, 37.17605]))
  .set('genus', 'Sequoia').set('species', 'sempervirens');

// Get a property from the feature.
var species = feature.get('species');
print(feature);
print(species);



var features = [
  ee.Feature(ee.Geometry.Rectangle(30.01, 59.80, 30.59, 60.15), {name: 'Voronoi'}),
  ee.Feature(ee.Geometry.Point(-73.96, 40.781), {name: 'Thiessen'}),
  ee.Feature(ee.Geometry.Point(6.4806, 50.8012), {name: 'Dirichlet', x:3})
];

// Create a FeatureCollection from the list and print it.
var fromList = ee.FeatureCollection(features);      



.........................................end of a section........................

var image = ee.Image('CGIAR/SRTM90_V4');
Map.setCenter(89.516, 23.713,7); 


Map.addLayer(image);

// its displaying for the whole world, now you can clip it for a region
print('SRTM image', image);

Map.addLayer(image, {min: 0, max: 300,
     palette: ['cyan','blue', 'green', 'red']},
    'custom palette');
var scale = image.projection().nominalScale();
print('SRTM scale in meters', scale);

var meanDict = image.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: geometry,
  scale: 90  
});

print(meanDict)

ploy = [polygon,geometry]
var x=[]
for (var i in poly){
  var meanDict = image.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: poly[i],
  scale: 90});
  x.push(meanDict)
  print(meanDict);
}
         .....................new section......................



var imgc = ee.ImageCollection('MODIS/006/MYD11A2')
.select('LST_Day_1km')
.filterDate('2020-01-1','2020-12-30')
.mean()
.clip(roi)
.multiply(.02).subtract(273.15);

var mask = imgc.gt(30);


var masked = imgc.updateMask(mask);

Map.addLayer(imgc, {min:25,max:35,palette:['blue', 'green', 'red']}, 'LST');
Map.addLayer(masked,{min: 30, max: 34,
palette: ['blue', 'green', 'red']}, 'LST_masked');


 Export.image.toDrive({image:imgc
 , description:'demmm'
 ,  region:roi
 , scale:1000
 })
 

         
         
          '''''''''''''''''''''''  landsat-8 collection..........................
//////// so far we've talked about single image, now we are gonna talk about img collection
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
.filterBounds(point)
.filterDate('2019-01-01', '2019-12-30')
.select('B[2-5]')
// .filterMetadata("CLOUD_COVER", "less_than", 5)
// .sort('CLOUD_COVER')
// .first()
;
print(l8.size())
var visParams = {bands: ['B4', 'B3', 'B2'], max: 0.3};
Map.addLayer(l8, visParams, 'true-color composite');

// // var visfalse = {bands: ['B5', 'B4', 'B3'], max: 0.3};


// var median = l8.median();

// // Display the median composite.
// // Map.addLayer(median, visParams, 'median');


// // ////////////////// masking ////////////

// var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');

// Select the land/water mask.
var datamask = hansenImage.select('datamask');

// Create a binary mask.
var mask = datamask.eq(1);
Map.addLayer(mask,{},  'masked');  //just showing land
// Update the composite mask with the water mask.
var maskedComposite = median.updateMask(mask);
Map.addLayer(maskedComposite, visParams, 'updated with median masked'); // excluding all water
// print('mc',maskedComposite)
// ///////////////   mosaic applies on collection of images ///////////

var water = mask.not();

// Mask water with itself to mask all the zeros (non-water).
water = water.updateMask(water);

// Make an image collection of visualization images.
var mosaic = ee.ImageCollection([
  median.visualize(visParams),
  water.visualize({palette: '000044'}),
]).mosaic()
// ;

// // Display the mosaic.
Map.addLayer(mosaic, {}, 'custom mosaic');

print(mosaic)  // so mosaic is displaying both images but result
//                  is only for water layer or the last layer


             ////////////        \\\\\\\\\\\\\\\\\



// Import the Landsat 8 TOA image collection.
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA');

// Get the least cloudy image in 2015.
var image = ee.Image(
  l8.filterBounds(roi)
    .filterDate('2015-01-01', '2015-12-31')
    .sort('CLOUD_COVER')
    .first()
);
// Compute the Normalized Difference Vegetation Index (NDVI).
var nir = image.select('B5');
var red = image.select('B4');
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

// Display the result.
Map.centerObject(image, 7);
var ndviParams = {min: -.5, max: .7, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi, ndviParams, 'NDVI image');


          //second
          
var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');

          // 3rd
          
// Compute the EVI using an expression.

var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B5'),
      'RED': image.select('B4'),
      'BLUE': image.select('B2')
});




var addNDVI = function(x) {
  var ndvi = x.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return x.addBands(ndvi);
};

// Test the addNDVI function on a single image.
var ndvi = addNDVI(image)
// .select('NDVI')
; // so now this ndvi image got one 
//                                           additional band called NDVI
print(ndvi)

// image.map(addNDVI);
 //here you can do l8.map() but not image.map()
 // cause map() goes with collection
 
 // Import the Landsat 8 TOA image collection.
 
          // Map()
 
 
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
.filterMetadata("CLOUD_COVER", "less_than", 1)
;

// Map a function over the Landsat 8 TOA collection to add an NDVI band.
var withNDVI = l8.map(function(image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
});

// Create a chart.
var chart = ui.Chart.image.series({
  imageCollection: withNDVI.select('NDVI'),
  region: roi,
  reducer: ee.Reducer.mean(),
  scale: 30
}).setOptions({title: 'NDVI over time'});

// // Display the chart in the console.
print(chart);
 
 
// ...........................................                  ...........
var cloudlessNDVI = l8.map(function(image) {
  // Get a cloud score in [0, 100].
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');

  // Create a mask of cloudy pixels from an arbitrary threshold.
  var mask = cloud.lte(20);

  // Compute NDVI.
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');

  // Return the masked image with an NDVI band.
  return image.addBands(ndvi).updateMask(mask);
});

var chart = ui.Chart.image.series({
  imageCollection: cloudlessNDVI.select('NDVI'),
  region: point.bounds(),
  reducer: ee.Reducer.mean(),
  scale: 30
}).setOptions({title: 'NDVI over time'});

// Display the chart in the console.
print(chart);
