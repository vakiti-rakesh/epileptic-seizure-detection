from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from model import predict_data, train_model

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ------------------ LIST MODELS ------------------
@app.route("/models", methods=["GET"])
def list_models():
    if not os.path.exists("models"):
        return jsonify({"available_models": []})

    versions = []

    for file in os.listdir("models"):
        if file.startswith("cnn_"):
            version = file.replace("cnn_", "").replace(".h5", "")
            versions.append(version)

    return jsonify({"available_models": sorted(versions)})

# ------------------ TRAIN ------------------
@app.route("/train", methods=["POST"])
def train():
    file = request.files["file"]
    dataset = pd.read_csv(file)
    result = train_model(dataset)
    return jsonify(result)

# ------------------ ENCRYPTED PREDICT ------------------
@app.route("/predictEncrypted", methods=["POST"])
def predict_encrypted():
    data = request.json

    encrypted_b64 = data.get("encrypted")
    iv_b64 = data.get("iv")
    key_b64 = data.get("key")
    city = data.get("city")
    version = data.get("version")

    if not all([encrypted_b64, iv_b64, key_b64]):
        return jsonify({"error": "Missing encryption data"}), 400

    try:
        # Base64 decode
        encrypted_bytes = base64.b64decode(encrypted_b64)
        iv = base64.b64decode(iv_b64)
        key_bytes = base64.b64decode(key_b64)

        aesgcm = AESGCM(key_bytes)

        # Decrypt
        decrypted_bytes = aesgcm.decrypt(iv, encrypted_bytes, None)

        # Convert decrypted bytes to DataFrame
        import io
        dataset = pd.read_csv(io.BytesIO(decrypted_bytes))

        # Run prediction logic
        #prediction, probability, version_used = predict_data(dataset, version)

        #new code
        prediction, probability, version_used, importance = predict_data(dataset, version)

        if prediction is None:
            return jsonify({"error": "No trained model found"}), 400

        avg_prob = float(np.mean(probability) * 100)
        if avg_prob > 70:
            risk_level = "High"
        elif avg_prob > 40:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        df = pd.read_csv("hospital_dataset.csv")
        df_city = df[df["city"].str.lower() == city.lower()]
        hospitals = df_city.to_dict(orient="records")

        response = {
            "prediction": prediction,
            "average_probability": avg_prob,
            "risk_level": risk_level,
            "hospitals": hospitals,
            "version_used": version_used,
            "feature_importance": importance
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)