import logging
from rest_framework import serializers
from .models import StudentProfile, Program, Hall, Wing, EmergencyContact

logger = logging.getLogger(__name__)

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name']


class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ['id', 'name']


class WingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wing
        fields = ['id', 'name']


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['name', 'phone']


class StudentProfileSerializer(serializers.ModelSerializer):

    # Accept IDs for program and hall when submitting data
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(),
        source='program',
        write_only=True
    )
    hall_id = serializers.PrimaryKeyRelatedField(
        queryset=Hall.objects.all(),
        source='hall_of_affiliation',
        write_only=True
    )
    
    # Wings: accept list of wing IDs when writing, return nested objects when reading
    wings = WingSerializer(many=True, read_only=True)
    wing_ids = serializers.PrimaryKeyRelatedField(
        queryset=Wing.objects.all(),
        source='wings',
        many=True,
        write_only=True,
        required=False
    )

    program = ProgramSerializer(read_only=True)
    hall = HallSerializer(source='hall_of_affiliation', read_only=True)
    emergency_contact = EmergencyContactSerializer(read_only=True)
    emergency_contact_data = EmergencyContactSerializer(write_only=True, required=False)
    
    # Custom ImageField that ensures full URL is returned
    id_picture = serializers.ImageField(required=False, allow_null=True)
    
    def to_representation(self, instance):
        """Override to ensure id_picture returns full URL"""
        ret = super().to_representation(instance)
        if instance.id_picture:
            # Get the full URL - Cloudinary returns full URL, local returns relative
            ret['id_picture'] = instance.id_picture.url if hasattr(instance.id_picture, 'url') else str(instance.id_picture)
        return ret

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'first_name', 'last_name', 'other_name', 'date_of_birth',
            'gender', 'marital_status', 'contact', 'email', 'emergency_contact', 'emergency_contact_data',
            'program', 'program_id', 'hall', 'hall_id',
            'place_of_residence', 'wings', 'wing_ids', 'id_picture', 'created_at'
        ]
        read_only_fields = ['program', 'hall', 'emergency_contact', 'wings']

    def create(self, validated_data):
        try:
            logger.info("Serializer create() called")
            logger.info(f"Validated data keys: {list(validated_data.keys())}")
            
            # Extract nested data
            emergency_contact_data = validated_data.pop('emergency_contact_data', None)
            wings_data = validated_data.pop('wings', [])
            
            logger.info(f"Creating student profile for: {validated_data.get('first_name', 'Unknown')} {validated_data.get('last_name', 'Unknown')}")
            
            # Create the student profile instance
            student = StudentProfile.objects.create(**validated_data)
            logger.info(f"Student profile created with ID: {student.id}")
            
            # Set ManyToMany relationships (wings)
            if wings_data:
                logger.info(f"Setting wings: {[w.id for w in wings_data]}")
                student.wings.set(wings_data)
            
            # Create emergency contact if provided
            if emergency_contact_data:
                logger.info("Creating emergency contact")
                EmergencyContact.objects.create(
                    student=student,
                    name=emergency_contact_data['name'],
                    phone=emergency_contact_data['phone']
                )
            
            logger.info(f"Student profile creation completed successfully: {student.id}")
            return student
            
        except Exception as e:
            logger.error(f"Error in serializer create(): {str(e)}", exc_info=True)
            raise