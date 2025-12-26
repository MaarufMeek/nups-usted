# Image Storage System - Complete Breakdown

## Overview
The system automatically detects whether it's running **locally** (development) or on **Render** (production) and switches between:
- **Local**: Files stored in `media/` folder (filesystem)
- **Render**: Files stored in Cloudinary (cloud storage)

---

## 🔍 How the System Detects Environment

### Detection Mechanism
The system uses the `USE_CLOUDINARY` environment variable to determine which storage to use:

1. **Local Development** (default):
   - `USE_CLOUDINARY` is not set OR set to `false`
   - Uses local filesystem storage (`media/` folder)

2. **Render Production**:
   - `USE_CLOUDINARY=true` is set in Render's environment variables
   - Uses Cloudinary cloud storage

### Code Location: `nups/settings.py`

```python
# Read USE_CLOUDINARY from environment
USE_CLOUDINARY = get_env("USE_CLOUDINARY", False, cast=bool)
```

**How it works:**
- Checks `os.environ` first (Render environment variables)
- Falls back to `.env` file if present (local development)
- Defaults to `False` if not set (local storage)

---

## 📝 All Changes Made

### 1. **Enhanced Boolean Parsing** (`nups/settings.py`)

**Problem:** Python's `bool("false")` returns `True` (any non-empty string is truthy)

**Solution:** Added special handling for boolean casting

```python
def get_env(key, default=None, cast=None):
    # ... existing code ...
    if cast and value is not None:
        # Special handling for bool to properly convert string "true"/"false"
        if cast == bool:
            if isinstance(value, str):
                return value.lower() in ('true', '1', 'yes', 'on')
            return bool(value)
        return cast(value)
```

**How it works:**
- Converts string `"true"` → `True`
- Converts string `"false"` → `False`
- Handles variations: `"1"`, `"yes"`, `"on"` → `True`

---

### 2. **Cloudinary Configuration** (`nups/settings.py`)

**Location:** Lines 78-88, 224-259

**What it does:**
- Conditionally adds Cloudinary apps to `INSTALLED_APPS`
- Configures Cloudinary credentials from environment variables
- Sets `DEFAULT_FILE_STORAGE` to Cloudinary storage

```python
USE_CLOUDINARY = get_env("USE_CLOUDINARY", False, cast=bool)

if USE_CLOUDINARY:
    # Add Cloudinary apps
    INSTALLED_APPS.insert(-1, "cloudinary_storage")
    INSTALLED_APPS.insert(-1, "cloudinary")
    
    # Later in settings...
    if USE_CLOUDINARY:
        CLOUDINARY_STORAGE = {
            'CLOUD_NAME': get_env('CLOUDINARY_CLOUD_NAME', ''),
            'API_KEY': get_env('CLOUDINARY_API_KEY', ''),
            'API_SECRET': get_env('CLOUDINARY_API_SECRET', ''),
        }
        DEFAULT_FILE_STORAGE = MediaCloudinaryStorage
```

**How it works:**
- Only loads Cloudinary if `USE_CLOUDINARY=True`
- Prevents import errors when Cloudinary isn't needed (local dev)
- Sets up Cloudinary credentials from environment variables

---

### 3. **Explicit Storage Assignment** (`core/apps.py`)

**Problem:** `DEFAULT_FILE_STORAGE` wasn't being applied automatically to ImageField

**Solution:** Explicitly set storage on the field when Django is ready

```python
class CoreConfig(AppConfig):
    def ready(self):
        """Configure storage when app is ready"""
        from django.conf import settings
        if getattr(settings, 'USE_CLOUDINARY', False):
            try:
                from cloudinary_storage.storage import MediaCloudinaryStorage
                from .models import StudentProfile
                # Get the field and set its storage
                field = StudentProfile._meta.get_field('id_picture')
                field.storage = MediaCloudinaryStorage()
            except Exception as e:
                print(f"[APPS] Error setting Cloudinary storage: {e}")
```

**How it works:**
- `ready()` is called after Django fully initializes
- Checks if Cloudinary is enabled
- Gets the `id_picture` field from the model
- Explicitly assigns Cloudinary storage to the field
- This ensures the field uses Cloudinary even if `DEFAULT_FILE_STORAGE` isn't applied

**Why this is needed:**
- Django doesn't always apply `DEFAULT_FILE_STORAGE` to existing fields
- Setting it explicitly guarantees Cloudinary is used

---

### 4. **Model Field** (`core/models.py`)

**Location:** Lines 86-92

```python
id_picture = models.ImageField(
    upload_to="id_pictures/",
    blank=True,
    null=True
    # Storage will be set in AppConfig.ready() if Cloudinary is enabled
)
```

**How it works:**
- Field doesn't specify storage (uses `None`)
- Storage is set dynamically in `CoreConfig.ready()`
- If Cloudinary is enabled → uses Cloudinary storage
- If Cloudinary is disabled → uses default filesystem storage

---

### 5. **Serializer URL Handling** (`core/serializers.py`)

**Location:** Lines 63-92

**What it does:**
- Ensures image URLs are returned correctly
- Handles both Cloudinary (full URLs) and local (relative URLs)

```python
def to_representation(self, instance):
    """Override to ensure id_picture returns full URL"""
    ret = super().to_representation(instance)
    if instance.id_picture:
        try:
            instance.refresh_from_db()
            image_url = instance.id_picture.url
            
            # If it's a relative URL but we're using Cloudinary, 
            # try to get the Cloudinary URL directly
            if image_url.startswith('/media/') and hasattr(instance.id_picture.storage, 'url'):
                try:
                    cloudinary_url = instance.id_picture.storage.url(instance.id_picture.name)
                    if cloudinary_url.startswith('http'):
                        ret['id_picture'] = cloudinary_url
                    else:
                        ret['id_picture'] = image_url
                except:
                    ret['id_picture'] = image_url
            else:
                ret['id_picture'] = image_url
        except Exception as e:
            logger.error(f"Error getting image URL: {e}")
            ret['id_picture'] = None
    return ret
```

**How it works:**
- Gets the image URL from the model instance
- If URL is relative (`/media/...`) but Cloudinary is enabled, tries to get full Cloudinary URL
- Returns full URL (Cloudinary) or relative URL (local) as appropriate

---

### 6. **Frontend URL Helper** (`frontend/nups/src/apiConfig.ts`)

**Location:** Lines 54-73

```typescript
export const toAbsoluteBackendUrl = (url: string): string => {
    // Return empty string if url is falsy
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return "";
    }
    
    // If already absolute (Cloudinary URL), return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    
    // Extract backend origin from BASE_URL
    const backendOrigin = BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000";
    
    // Ensure URL starts with /
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    
    return `${backendOrigin}${cleanUrl}`;
};
```

**How it works:**
- **Cloudinary URLs** (start with `https://`): Returns as-is
- **Local URLs** (start with `/media/`): Converts to absolute backend URL
- Example: `/media/id_pictures/image.jpg` → `http://localhost:8000/media/id_pictures/image.jpg`

---

### 7. **Logging for Debugging** (`core/serializers.py`)

**Location:** Lines 124-139

**What it does:**
- Logs image storage information after creation
- Helps identify which storage is being used

```python
if student.id_picture:
    image_url = student.id_picture.url
    storage_class = type(student.id_picture.storage).__name__
    storage_module = type(student.id_picture.storage).__module__
    
    logger.info(f"Image URL after save: {image_url}")
    logger.info(f"Image storage class: {storage_class} from {storage_module}")
    
    if 'cloudinary' in storage_module.lower():
        logger.info("✓ Using Cloudinary storage!")
    else:
        logger.warning(f"✗ NOT using Cloudinary storage! Using {storage_class}")
```

**How it works:**
- After saving, logs the storage class being used
- Confirms whether Cloudinary or local storage is active
- Helps debug storage issues

---

## 🔄 Complete Flow

### **On Local (Development):**

1. `USE_CLOUDINARY` is not set or `false`
2. `get_env("USE_CLOUDINARY")` returns `False`
3. Cloudinary apps are NOT added to `INSTALLED_APPS`
4. `CoreConfig.ready()` doesn't set Cloudinary storage
5. ImageField uses default filesystem storage
6. Images saved to `media/id_pictures/` folder
7. URLs returned as `/media/id_pictures/image.jpg`
8. Frontend converts to `http://localhost:8000/media/id_pictures/image.jpg`

### **On Render (Production):**

1. `USE_CLOUDINARY=true` is set in Render environment variables
2. `get_env("USE_CLOUDINARY")` returns `True`
3. Cloudinary apps ARE added to `INSTALLED_APPS`
4. `CoreConfig.ready()` sets Cloudinary storage on ImageField
5. ImageField uses `MediaCloudinaryStorage`
6. Images uploaded to Cloudinary cloud storage
7. URLs returned as `https://res.cloudinary.com/.../image.jpg`
8. Frontend uses URL as-is (already absolute)

---

## 🎯 Key Points

1. **Automatic Detection**: System automatically detects environment via `USE_CLOUDINARY`
2. **No Code Changes Needed**: Same code works for both local and Render
3. **Explicit Storage Assignment**: Storage is set explicitly in `AppConfig.ready()` to ensure it works
4. **URL Handling**: Both relative (local) and absolute (Cloudinary) URLs are handled correctly
5. **Persistence**: Images on Render persist across deployments (stored in Cloudinary, not ephemeral filesystem)

---

## 🔧 Environment Variables

### **Local Development** (`.env` file - optional):
```env
USE_CLOUDINARY=false
# Or simply don't set it
```

### **Render Production** (Environment tab):
```
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ✅ Verification

To verify which storage is being used, check the logs:

**Local:**
```
[SETTINGS] USE_CLOUDINARY = False
[SETTINGS] Cloudinary NOT enabled - using local storage
Image storage class: DefaultStorage from django.core.files.storage
```

**Render:**
```
[SETTINGS] USE_CLOUDINARY = True
[SETTINGS] Cloudinary apps added to INSTALLED_APPS
[APPS] Set Cloudinary storage on id_picture field: MediaCloudinaryStorage
Image storage class: MediaCloudinaryStorage from cloudinary_storage.storage
✓ Using Cloudinary storage!
```

