
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
            return { fname: meta }

def scale_image(arr, minimum, maximum):
    """Scale an array to uint8"""
    
    extent = float(maximum - minimum)
    
    arr = (arr - minimum) / extent
    arr *= 255.0
    arr = np.round(arr).astype('uint8')
    
    output = StringIO.StringIO()
    img = Image.fromarray(arr)
    img.save(output, format='PNG')
    output.seek(0)
    
    return output