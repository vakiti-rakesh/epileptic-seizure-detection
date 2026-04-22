import numpy as np
import os
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn import svm
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from tensorflow.keras.models import Sequential, Model, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.utils import to_categorical

MODEL_DIR = "models"
VERSION_FILE = "model_version.json"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def get_next_version():
    if not os.path.exists(VERSION_FILE):
        version = 1
    else:
        with open(VERSION_FILE, "r") as f:
            version = json.load(f)["version"] + 1

    with open(VERSION_FILE, "w") as f:
        json.dump({"version": version}, f)

    return f"v{version}"

def get_latest_version():
    if not os.path.exists(VERSION_FILE):
        return None
    with open(VERSION_FILE, "r") as f:
        version = json.load(f)["version"]
    return f"v{version}"

def train_model(dataset):
    dataset.fillna(0, inplace=True)
    dataset = dataset.values

    X = dataset[:, :-1]
    Y = dataset[:, -1]

    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    Y_cat = to_categorical(Y)

    X = np.reshape(X, (X.shape[0], 20, 20, 3))

    X_train, X_test, y_train, y_test = train_test_split(
        X, Y_cat, test_size=0.2, random_state=42
    )

    cnn = Sequential([
        Conv2D(32, (3,3), activation='relu', input_shape=(20,20,3)),
        MaxPooling2D((2,2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dense(y_train.shape[1], activation='softmax')
    ])

    cnn.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    cnn.fit(X_train, y_train, epochs=5, batch_size=16, verbose=0)

    feature_extractor = Model(cnn.inputs, cnn.layers[-2].output)
    features = feature_extractor.predict(X, verbose=0)

    Xf_train, Xf_test, yf_train, yf_test = train_test_split(
        features, Y, test_size=0.2, random_state=42
    )

    svm_model = svm.SVC(probability=True)
    svm_model.fit(Xf_train, yf_train)

    preds = svm_model.predict(Xf_test)

    metrics = {
        "accuracy": float(accuracy_score(yf_test, preds) * 100),
        "precision": float(precision_score(yf_test, preds, average='macro') * 100),
        "recall": float(recall_score(yf_test, preds, average='macro') * 100),
        "f1_score": float(f1_score(yf_test, preds, average='macro') * 100),
    }

    version = get_next_version()

    cnn.save(f"{MODEL_DIR}/cnn_{version}.h5")
    pickle.dump(svm_model, open(f"{MODEL_DIR}/svm_{version}.pkl", "wb"))
    pickle.dump(scaler, open(f"{MODEL_DIR}/scaler_{version}.pkl", "wb"))

    metrics["version"] = version
    return metrics

#new code
def get_feature_importance(features):

    # Average absolute feature contribution
    importance = np.mean(np.abs(features), axis=0)

    # Get top 10 most important features
    top_indices = np.argsort(importance)[-10:][::-1]

    results = []

    for idx in top_indices:
        results.append({
            "feature": f"Feature_{idx}",
            "importance": float(importance[idx])
        })

    return results
def predict_data(dataset, selected_version=None):

    version = selected_version if selected_version else get_latest_version()

    if version is None:
        return None, None, None

    scaler = pickle.load(open(f"{MODEL_DIR}/scaler_{version}.pkl", "rb"))
    cnn = load_model(f"{MODEL_DIR}/cnn_{version}.h5")
    svm_model = pickle.load(open(f"{MODEL_DIR}/svm_{version}.pkl", "rb"))

    dataset.fillna(0, inplace=True)
    X = scaler.transform(dataset.values)
    X = np.reshape(X, (X.shape[0], 20,20,3))

    feature_extractor = Model(cnn.inputs, cnn.layers[-2].output)
    features = feature_extractor.predict(X, verbose=0)

    preds = svm_model.predict(features)
    probs = svm_model.predict_proba(features)[:,1]
    #new code
    importance = get_feature_importance(features)

    return preds.tolist(), probs.tolist(), version, importance