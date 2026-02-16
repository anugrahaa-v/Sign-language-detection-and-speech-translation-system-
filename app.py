from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import json
import os

app = Flask(__name__)
app.secret_key = "kanineb7sjsn3sih3sn3sh3sin3s"

ADMIN_USERNAME = "Admin"
ADMIN_PASSWORD = "Admin"

# Configuration file path
CONFIG_PATH = 'config/gesture_config.json'

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if (request.form['username'] == ADMIN_USERNAME and 
            request.form['password'] == ADMIN_PASSWORD):
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        flash("Invalid credentials")
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/config')
def config_page():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('config.html')

@app.route('/index')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- THIS IS THE FIXED SECTION ---
@app.route('/api/gestures', methods=['GET', 'POST'])
def handle_gestures():
    # 1. Handle Saving (POST)
    if request.method == 'POST':
        try:
            new_data = request.json
            # Ensure directory exists just in case
            os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
            
            with open(CONFIG_PATH, 'w') as f:
                json.dump(new_data, f, indent=2)
            return jsonify({"status": "success", "message": "Configuration saved!"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # 2. Handle Loading (GET)
    else:
        try:
            with open(CONFIG_PATH, 'r') as f:
                return jsonify(json.load(f))
        except FileNotFoundError:
            # Return empty structure if file is missing
            return jsonify({"gestures": []})

if __name__ == '__main__':
    app.run(debug=True)
