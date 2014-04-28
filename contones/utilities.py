
import os
import StringIO

import numpy as np
import rasterio
from PIL import Image

#
#   Mapping and filter functions
#

def get_metadata(fname, root):
    """Get metadata for a given file."""
    
    fpath = os.path.join(root, fname)
    
    with rasterio.drivers():
        with rasterio.open(fpath) as src:
            meta = dict(src.meta)
            meta.pop('dtype', None)
            return meta

def scale_image(arr, minimum, maximum):
    """Scale an array to uint8"""
    
    extent = float(maximum - minimum)
    arr = np.clip(arr, minimum, maximum)
    
    arr = (arr - minimum) / extent
    arr *= 255.0
    arr = np.round(arr).astype('uint8')
    
    output = StringIO.StringIO()
    img = Image.fromarray(arr)
    img.save(output, format='PNG')
    output.seek(0)
    
    return output

def get_color_bands(count):
    """
    Reasonable defaults for the order in which bands are stored in multispectral geotiffs.
    """
    return [1, 2, 3] if count is 3 else [3, 2, 1]