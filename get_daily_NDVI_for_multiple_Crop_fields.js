polygon ="your shp file"

var startDate = '2013-03-18';
var endDate = '2022-12-31';

// Function to calculate NDVI for Landsat 5
var calculateNDVIl5 = function(image) {
  return image.normalizedDifference(['B4', 'B3']) // Landsat 5: B4 (NIR), B3 (Red)
    .copyProperties(image, ['system:time_start']);
};

// Function to calculate NDVI
var calculateNDVI = function(image) {
  return image.normalizedDifference(['B5', 'B4'])
 // .rename ("NDVI")
    .copyProperties(image, ['system:time_start']);
};

// Define a cloud masking function for Landsat 5
var maskL5Clouds = function(image) {
  // Select the QA_PIXEL band (quality assurance)
  var qa = image.select('QA_PIXEL'); // If unavailable, try 'pixel_qa' or 'QA'

  // Bitmask for clouds and cloud shadows
  var cloudBitMask = (1 << 3); // Clouds (bit 3)
  var cloudShadowBitMask = (1 << 4); // Cloud shadows (bit 4)

  // Mask pixels with clouds or cloud shadows
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cloudShadowBitMask).eq(0));

  // Apply the mask to the image
  return image.updateMask(mask);
};

// Define a cloud masking function for Landsat 8
var maskL8Clouds = function(image) {
  // Select the QA_PIXEL band (quality assurance)
  var qa = image.select('QA_PIXEL');

  // Bitmask for clouds and cloud shadows
  var cloudBitMask = (1 << 3); // Clouds (bit 3)
  var cloudShadowBitMask = (1 << 4); // Cloud shadows (bit 4)

  // Mask pixels with clouds or cloud shadows
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cloudShadowBitMask).eq(0));

  // Apply the mask to the image
  return image.updateMask(mask);
};
        // ----- masking and NDVI---------

// Filter Landsat 8 by date, bounds, and cloud cover
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate(startDate, endDate)
  .filterBounds(polygon)
  .filterMetadata('CLOUD_COVER', 'less_than', 50) // Filter by cloud cover
  .map(maskL8Clouds) // Apply cloud masking
  .map(calculateNDVI); // Calculate NDVI

// Print a sample image to verify
print('Landsat 8 Collection:', landsat8.limit(2));

        // -------- L5--------------





// Filter Landsat 5 Collection 2 Tier 1
var landsat5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_TOA')
  .filterDate('2006-01-01', "2013-03-17") // Adjust time range for Landsat 5
  .filterBounds(polygon) // Use your region of interest
  .filterMetadata('CLOUD_COVER', 'less_than', 50) // Filter by cloud cover
  .map(maskL5Clouds) // Apply cloud masking
  .map(calculateNDVIl5); // Calculate NDVI

// Print a sample to verify
print('Filtered and Cloud-Masked Landsat 5 Collection:', landsat5.limit(5));

   //------------ l7 -------------------
var landsat7 = ee.ImageCollection('LANDSAT/LE07/C02/T1_TOA')
  .filterDate('2006-01-01', '2013-03-17') // Adjust time range for Landsat 7
  .filterBounds(polygon) // Use your region of interest
  .filterMetadata('CLOUD_COVER', 'less_than', 50) // Filter by cloud cover
  .map(maskL5Clouds) // Apply cloud masking
  .map(calculateNDVIl5);

     // ------ daily NDVI Calculation for each polygon

// Function to calculate daily mean NDVI
var calculateDailyMean = function(image) {
  // Apply reduceRegions to calculate mean NDVI for each polygon
  var ET_values = image
  // .select("NDVI")
  .reduceRegions({
    collection: polygon,
    reducer: ee.Reducer.mean(),
    scale: 30, // Adjust the scale accordingly 60 for l5
  });
  
  //  ET_values is a feature collection, to get values of each feature we
  // are again applying a finction
  
  var dailyMeanFC = ET_values.map(function(feature) {
    var allProperties = feature.toDictionary(); // to see all attributes
    var fid = feature.get('FieldID'); // Get the FieldID
    var NDVI = feature.get('mean'); // Get the mean ET value
   

    // Return a new feature with the necessary properties
    return ee.Feature(feature.geometry(), {
      'date': ee.Date(image.get('system:time_start')).format('YYYY-MM-dd'),
      'FieldID': fid,
      'NDVI': NDVI, // Explicitly retain the ET value,
      "prop": allProperties
    });
  });

  return dailyMeanFC;
};



// var dailyNDVI8 = landsat8.map(calculateDailyMean).flatten();
// var dailyNDVI5 = landsat5.map(calculateDailyMean).flatten();
var dailyNDVI7 = landsat7.map(calculateDailyMean).flatten();
// print(dailyNDVI8 .limit(5));
// print("L5:",dailyNDVI5 .limit(5));
print("L7:",dailyNDVI7 .limit(5));


        // Export the results as a CSV
        
// Export.table.toDrive({
//   collection: dailyNDVI8 ,
//   description: 'Landsat8_NDVI_2014_2022',
//   selectors: ['FieldID', 'date', 'NDVI'],
//   fileFormat: 'CSV'
// });


// Export.table.toDrive({
//   collection: dailyNDVI5 ,
//   description: 'Landsat5_NDVI_2006_2013',
//   selectors: ['FieldID', 'date', 'NDVI'],
//   fileFormat: 'CSV'
// });

Export.table.toDrive({
  collection: dailyNDVI7 ,
  description: 'Landsat7_NDVI_2006_2013',
  selectors: ['FieldID', 'date', 'NDVI'],
  fileFormat: 'CSV'
});
