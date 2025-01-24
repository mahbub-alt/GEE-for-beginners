// ------------------Monthly ET-----------------------
var polygon = "import your shp file"

var dataset = ee.ImageCollection('OpenET/ENSEMBLE/CONUS/GRIDMET/MONTHLY/v2_0')
  .filterDate('2006-01-01', '2022-12-30')
  .select('et_ensemble_mad')
  .filterBounds(polygon); // filterbounds is essential

// Function to calculate daily/Monthly mean ET
var calculateDailyMean = function(image) {
  // Apply reduceRegions to calculate mean ET for each polygon
  var ET_values = image
  .reduceRegions({
    collection: polygon,
    reducer: ee.Reducer.mean(),
    scale: 30, // Adjust the scale accordingly
  });
  
  //  ET_values is a feature collection, to get values of each feature we
  // are again applying a function
  
  var dailyMeanFC = ET_values.map(function(feature) {
    // var allProperties = feature.toDictionary(); // to see all attributes
    var fid = feature.get('FieldID'); // Get the FieldID
    var ET = feature.get('mean'); // Get the mean ET value
   

    // Return a new feature with the necessary properties
    return ee.Feature(feature.geometry(), {
      'date': ee.Date(image.get('system:time_start')).format('YYYY-MM-dd'),
      'FieldID': fid,
      'ET': ET, // Explicitly retain the ET value,
    });
  });

  return dailyMeanFC;
};

// Apply the function to the images
var dailyET = dataset.map(calculateDailyMean).flatten();

// Print the output to verify
print(dailyET.limit(10));

Export.table.toDrive({
  collection: dailyET,
  description: 'ET_2nd',
  fileFormat: 'CSV',
  selectors: ['date', 'FieldID', 'ET'], // Adjust selectors as needed
});


Map.addLayer(dataset.median(), {}, 'img');

Map.addLayer(polygon, {color: 'cyan'}, 'fcPolygon');
