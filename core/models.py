from django.db import models
from django.conf import settings


# =========================
# LOOKUP TABLES
# =========================

class Program(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Hall(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Wing(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# =========================
# MAIN PROFILE
# =========================

class StudentProfile(models.Model):

    # Personal Details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    other_name = models.CharField(max_length=100, blank=True, null=True)

    date_of_birth = models.DateField()

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    MARITAL_STATUS_CHOICES = [
        ("Single", "Single"),
        ("Married", "Married"),
        ("Divorced", "Divorced"),
        ("Widowed", "Widowed"),
    ]
    marital_status = models.CharField(
        max_length=10,
        choices=MARITAL_STATUS_CHOICES
    )

    # Contact
    contact = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    # Education
    program = models.ForeignKey(
        Program,
        on_delete=models.SET_NULL,
        null=True
    )

    # Address / Residence
    place_of_residence = models.CharField(max_length=255)

    hall_of_affiliation = models.ForeignKey(
        Hall,
        on_delete=models.SET_NULL,
        null=True
    )

    # Wings (many choices allowed)
    wings = models.ManyToManyField(
        Wing,
        blank=True
    )

    # ID Picture upload
    # Storage will be set in AppConfig.ready() if Cloudinary is enabled
    id_picture = models.ImageField(
        upload_to="id_pictures/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# =========================
# EMERGENCY CONTACT
# =========================

class EmergencyContact(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="emergency_contact"
    )
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.student})"
