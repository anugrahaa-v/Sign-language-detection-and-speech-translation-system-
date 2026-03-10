import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

print("Checking Dataset Loading...\n")

# Dataset path
train_path = "Datasets/Sign-Language-Digits-Datase/train"
valid_path = "Datasets/Sign-Language-Digits-Datase/valid"

# Image settings
img_size = (64, 64)
batch_size = 32

# Data generator
datagen = ImageDataGenerator(rescale=1./255)

# Load training data
print("Loading Training Dataset...")
train_data = datagen.flow_from_directory(
    train_path,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical'
)

# Load validation data
print("\nLoading Validation Dataset...")
valid_data = datagen.flow_from_directory(
    valid_path,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical'
)

print("\n===== DATASET INFORMATION =====")
print("Number of Classes:", len(train_data.class_indices))
print("Class Names:", train_data.class_indices)
print("Training Samples:", train_data.samples)
print("Validation Samples:", valid_data.samples)
