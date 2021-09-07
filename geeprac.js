
// Intro to GEE interface


var num = 5; //int

var listOfNumbers = [0, 'x', 1, 2, 3, 5];

var num = ee.Number(5);
var eeString = ee.String('aString');
var eeList = ee.List([1, 2, 3, 4, 5]);
var sequence = ee.List.sequence(1, 5);
print(typeof(num));
print(typeof(listOfNumbers));

var vector = ee.Array([1, 2, 3]);       // 1-D array, variation on the 0-axis
print(arr.length());

var sequence = ee.List.sequence(1, 10);
print(sequence)

print(sequence.get(5))

print(sequence.slice(1,5))

var object = {
  foo: 'bar',
  baz: 13,
  stuff: ['this', 'that', 'the other thing']
};
print('Dictionary:', object);

print('Print foo:', object['baz']);

print('Print stuff:', object.stuff[0]);

//////////          ///////////////////////
var sequence = ee.List.sequence(1, 10);
print(sequence)
var reflect = function(parameter) {
  // Return the argument.
  return ee.Number(parameter).pow(2);  //here say something why
  //                                      we use ee.
};
print(reflect(2));
print(sequence.map(reflect))  // so to itterate over more 


     // end of first part//
  // now before get into img processing lets see how to load country data and some other basic stuff
                       Map.setCenter(lat,long,zoom)

  var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.eq('ADM0_NAME', 'Bangladesh'));  // country shp
  
  
  var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.eq('ADM1_NAME', 'Dhaka')); 
  
  var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.eq('ADM2_NAME', 'Netrakona')); 
  var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.inList('ADM1_NAME', ['Dhaka','Khulna'])).union()
  
  var dataset = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.inList('ADM1_NAME', ['Dhaka','Khulna'])).geometry().dissolve()

var geoArea = geometry.area();
print(geoArea.divide(1000000))

// Talk about geometry and feature        so geometry has no property while feature has some property 
// like a shapefile with a table

print(f.get('area')); 


var polygon = ee.Geometry.Polygon([
  [[-35, -10], [35, -10], [35, 10], [-35, 10], [-35, -10]]
]);

// Create a Feature from the Geometry.
var polyFeature = ee.Feature(polygon, {foo: 42, bar: 'tart'});

print( polyFeature)

var feature = ee.Feature(ee.Geometry.Point([-122.22599, 37.17605]))
  .set('genus', 'Sequoia').set('species', 'sempervirens');

// Get a property from the feature.
var species = feature.get('species');
print(feature);
print(species);

// Buffer
var buff = point.buffer(5000,100);
// Map.addLayer(buff)

var bounGeo = geometry.bounds();
print(bounGeo)
// number is the maximum error in meters.
var interGeo = geometry.intersection(geometry2,100);
Map.addLayer(interGeo)





// Set a new property.
feature = feature.set('presence', 1);

print(feature);

// Make a list of Features.
var features = [
  ee.Feature(ee.Geometry.Rectangle(30.01, 59.80, 30.59, 60.15), {name: 'Voronoi'}),
  ee.Feature(ee.Geometry.Point(-73.96, 40.781), {name: 'Thiessen'}),
  ee.Feature(ee.Geometry.Point(6.4806, 50.8012), {name: 'Dirichlet', x:3})
];

// Create a FeatureCollection from the list and print it.
var fromList = ee.FeatureCollection(features);
print(fromList);
Map.addLayer(fromList)

// now lets talk about feature collection




Map.setCenter(89,21,7)
Map.addLayer(dataset,{color:'darkblue'})

// Load a Landsat 8 image.
var image = ee.Image('LANDSAT/LC08/C01/T1/LC08_044034_20140318');

// Combine the mean and standard deviation reducers.
var reducers = ee.Reducer.mean().combine({
  reducer2: ee.Reducer.stdDev(),
  sharedInputs: true
});

// Use the combined reducer to get the mean and SD of the image.
var stats = image.reduceRegion({
  reducer: reducers,
  bestEffort: true,
});

// Display the dictionary of band means and SDs.
print(stats);


             ////////////        \\\\\\\\\\\\\\\\\

var image = ee.Image('CGIAR/SRTM90_V4');
Map.setCenter(89.516, 23.713,7); // Center on the Grand Canyon.


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
    

            //  Now let's talk about an image collection  //

            var imgc = ee.ImageCollection('MODIS/006/MYD11A2')
            .select('LST_Day_1km')
            .filterDate('2018-12-30', '2020-4-27')
            .mean()
            .clip(roi) // so clip should be after mean() cz it can't applied on collection
            .multiply(0.02).subtract(273.15)
            ;
            
            var mask = imgc.gt(28);
            var masked = imgc.updateMask(mask);
            
            Map.addLayer(imgc, {min: 24, max: 32, palette: ['blue', 'green', 'red']}, 'LST');
            Map.addLayer(masked,{min: 28, max: 34, palette: ['blue', 'green', 'red']}, 'LST_masked');
            
            print(masked);
            
            Export.image.toDrive({
              image: masked,
              description: 'imagenewwwwww',
              scale: 1000,
              region: roi
            });

















            var range = collection.reduceColumns(ee.Reducer.minMax(), ["system:time_start"])

var landsat8_2019 = l8.filterBounds(geom)
.filterDate("2018-12-01", "2019-12-31")
.filterMetadata("CLOUD_COVER", "less_than", 1)
.select(bands)
.mean();

for st2 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20)