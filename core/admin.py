from django.contrib import admin

from .models import Program, Hall, Wing, StudentProfile, EmergencyContact

admin.site.register(Program)
admin.site.register(Hall)
admin.site.register(Wing)
admin.site.register(StudentProfile)
admin.site.register(EmergencyContact)