# sign_train.py
import os
import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

# -------------------------
# CONFIGURATION
# -------------------------
DATA_DIR = "sign_data"  # Folder containing subfolders for each sign (A, B, C,...)
IMG_SIZE = 64           # Resize images to 64x64
EPOCHS = 20
BATCH_SIZE = 32

# -------------------------
# LOAD DATA
# -------------------------
def load_data():
    images = []
    labels = []
    classes = sorted(os.listdir(DATA_DIR))
    print(f"Classes found: {classes}")
    
    for idx, label in enumerate(classes):
        label_dir = os.path.join(DATA_DIR, label)
        for file in os.listdir(label_dir):
            img_path = os.path.join(label_dir, file)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                images.append(img)
                labels.append(idx)
    
    images = np.array(images, dtype="float32") / 255.0
    labels = to_categorical(labels, num_classes=len(classes))
    
    return train_test_split(images, labels, test_size=0.2, random_state=42), classes

# -------------------------
# BUILD MODEL
# -------------------------
def build_model(num_classes):
    model = Sequential([
        Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D(2,2),
        Conv2D(64, (3,3), activation='relu'),
        MaxPooling2D(2,2),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# -------------------------
# MAIN TRAINING
# -------------------------
def main():
    (X_train, X_test, y_train, y_test), classes = load_data()
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")
    
    model = build_model(len(classes))
    model.summary()
    
    model.fit(X_train, y_train, validation_data=(X_test, y_test),
              epochs=EPOCHS, batch_size=BATCH_SIZE)
    
    model.save("sign_language_model.h5")
    print("Training complete! Model saved as sign_language_model.h5")
    
    # Save class names
    with open("classes.txt", "w") as f:
        for c in classes:
            f.write(f"{c}\n")
    print("Class labels saved in classes.txt")

if __name__ == "__main__":
    main()
