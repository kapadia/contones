#!flask/bin/python

import os
import argparse
import json
import inspect
import StringIO

from flask import Flask, jsonify, make_response, send_file, url_for
import numpy as np
from scipy import ndimage
from scipy.stats import scoreatpercentile
from PIL import Image
import rasterio

from contones.utilities import get_metadata, scale_image, get_color_bands


root_dir = os.path.dirname(
    os.path.abspath(inspect.getfile(inspect.currentframe())))
static_path = os.path.join(root_dir, 'static')
app = Flask('contone', static_path=static_path)
DATA_DIR = None

#
#   Static Content
#

@app.route('/', methods=['GET'])
@app.route('/contone/<path:path>', methods=['GET'])
def index(path=None):
    return send_file(url_for("static", filename='index.html'), mimetype="text/html")


@app.route('/static/<path:fpath>', methods=['GET'])
def get_static(fpath):
    return send_file(url_for("static", filename=fpath))


#
#   JSON + Image API
#

#
#   Filesystem
#

@app.route('/api/files/', methods=['GET'])
@app.route('/api/files/<path:relpath>', methods=['GET'])
def get_files(relpath=''):
    """
    List contents of a directory. Filter files except for tiffs.
    The path argument is relative to the DATA_DIR path.
    """
    abspath = os.path.join(DATA_DIR, relpath)
    if not os.path.exists(abspath):
        return jsonify({'error': 'Path does not exist'})
    
    items = os.listdir(abspath)
    
    def format_items(item):
        item_abspath = os.path.join(abspath, item)
        return {
            'path': os.path.join(relpath, item),
            'isDir': os.path.isdir(item_abspath)
        }
    
    def filter_items(item):
        
        # Check for hidden files
        if item['path'].startswith('.'):
            return False
        
        # Check extension and directories
        ext = os.path.splitext(item['path'])[1]
        if (ext in ['.tif', '.tiff']) or (item['isDir']):
            return True
        
        return False
    
    items = map(format_items, items)
    items = filter(filter_items, items)
    
    return json.dumps(items)


@app.route('/api/rasters', methods=['GET'])
def get_raster_directory():
    """Return a list of images and directories in the user specfied directory."""

    images = filter(lambda f: os.path.splitext(
        f)[1] in ['.tif', '.tiff'], os.listdir(DATA_DIR))
    metadata = map(
        get_metadata, images, [DATA_DIR for i in range(len(images))])

    metadata_dict = {k: v for d in metadata for k, v in d.items()}
    return json.dumps(metadata_dict)


@app.route('/api/metadata/<path:filepath>', methods=['GET'])
def get_metadata_for_file(filepath):
    metadata = get_metadata(filepath, DATA_DIR)
    return json.dumps(metadata)


@app.route('/api/thumbnail/<path:filepath>')
def get_thumbnail(filepath):
    """ Get color thumbnail for a specified geotiff. """
    
    fpath = os.path.join(DATA_DIR, filepath)
    
    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})
    
    with rasterio.drivers():
        with rasterio.open(fpath) as src:
            
            def get_band(index):
                band = src.read_band(index)
                return ndimage.interpolation.zoom(band, 0.10)
            
            count = src.meta["count"]
            bands = map(get_band, get_color_bands(count))
    
    arr = np.dstack(bands)
    
    minimum, maximum = arr.min(), arr.max()
    output = scale_image(arr, float(minimum), float(maximum))
    
    return send_file(output, mimetype='image/png')


@app.route('/api/raster/<path:filepath>/<minimum>/<maximum>', methods=['GET'])
def get_color(filepath, minimum, maximum):
    """
    Get a color image.
    """
    fpath = os.path.join(DATA_DIR, filepath)
    
    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})

    with rasterio.drivers():
        with rasterio.open(fpath) as src:

            def get_band(index):
                band = src.read_band(index)
                return ndimage.interpolation.zoom(band, 0.20)

            count = src.meta["count"]
            bands = map(get_band, get_color_bands(count))

    arr = np.dstack(bands)

    minimum, maximum = arr.min(), arr.max()
    output = scale_image(arr, float(minimum), float(maximum))

    return send_file(output, mimetype='image/png')

@app.route('/api/raster/<path:filepath>/color/<int:r>/<int:g>/<int:b>', methods=['GET'])
def get_color_composite(filepath, r, g, b):
    
    fpath = os.path.join(DATA_DIR, filepath)
    
    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})
    
    
    with rasterio.drivers():
        with rasterio.open(fpath) as src:
            
            def get_band(index):
                band = src.read_band(index)
                return ndimage.interpolation.zoom(band, 0.20)
            
            bands = map(get_band, [r, g, b])
    
    arr = np.dstack(bands)
    minimum, maximum = arr.min(), arr.max()
    output = scale_image(arr, float(minimum), float(maximum))
    
    return send_file(output, mimetype='image/png')

@app.route('/api/raster/<path:filename>/<int:band_index>', methods=['GET'])
@app.route('/api/raster/<path:filename>/<int:band_index>/<minimum>/<maximum>', methods=['GET'])
# TODO: These defaults are only good with uint16 data.
def get_raster(filename, band_index, minimum=0, maximum=65535):
    """
    Get a single band image.

    Possible errors:

        * File doesn't exist
        * Band doesn't exist

    """
    fpath = os.path.join(DATA_DIR, filename)

    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})

    with rasterio.drivers():
        with rasterio.open(fpath) as src:

            if not band_index in map(lambda x: x + 1, range(7)):
                return jsonify({'error': 'Band index out of range'})

            band = src.read_band(band_index)

    band = ndimage.interpolation.zoom(band, 0.20)
    output = scale_image(band, float(minimum), float(maximum))

    return send_file(output, mimetype='image/png')

@app.route('/api/stats/histogram/<path:filepath>/<int:band_index>', methods=['GET'])
def get_histogram(filepath, band_index):
    """Get a histogram for a given band."""
    
    fpath = os.path.join(DATA_DIR, filepath)
    
    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})
    
    with rasterio.drivers():
        with rasterio.open(fpath) as src:
            
            if not band_index in map(lambda x: x + 1, range(7)):
                return jsonify({'error': 'Band index out of range'})
            
            band = src.read_band(band_index)
    
    arr = band.flatten()
    
    bins = 0.05 * np.iinfo(arr.dtype).max
    histogram, bin_edges = np.histogram(arr, bins=bins)
    obj = {
        "counts": histogram.tolist(),
        "bin_edges": bin_edges.tolist()
    }
    
    return jsonify(obj)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Cloud based image viewer for larger raster data.')
    parser.add_argument(
        "directory", help="specify the directory containing images to view.")
    args = parser.parse_args()

    # Make sure the data directory exists
    if os.path.exists(args.directory) is False:
        parser.print_help()
        parser.exit()

    DATA_DIR = args.directory
    app.run(debug=True, port=8000)
