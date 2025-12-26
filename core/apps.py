from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    
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
                print(f"[APPS] Set Cloudinary storage on id_picture field: {type(field.storage).__name__}")
            except Exception as e:
                print(f"[APPS] Error setting Cloudinary storage: {e}")
                import traceback
                traceback.print_exc()
