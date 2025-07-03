# ZRA Smart Invoice Integration

## Project Overview
This repository contains the source code for the ZRA Smart Invoice Integration, a Python-based application designed to automate the submission of sales invoice data from Xero to the Zambia Revenue Authority's (ZRA) Smart Invoice system via the Virtual Sales Data Controller (VSDC).

The primary goal is to ensure seamless compliance with ZRA regulations, enhance operational efficiency, and provide robust, real-time invoice submission capabilities.

## Features
* Secure Xero OAuth 2.0 authentication and token management.
* Automated retrieval of sales invoice data from Xero (via webhooks).
* Precise data mapping and transformation to ZRA VSDC API specifications.
* Secure communication and submission to ZRA VSDC (test/production environments).
* Comprehensive error handling, logging, and audit trails.
* Web-based administrative interface for monitoring and configuration.

## Technology Stack
* **Backend:** Python 3.9+ (Flask/FastAPI)
* **API Integration:** Xero API, ZRA VSDC API
* **Database:** PostgreSQL (Production), SQLite (Development)
* **Containerization:** Docker
* **Version Control:** Git
* **Deployment:** Cloud Hosting (e.g., Heroku, AWS, Azure, GCP)

## Setup and Local Development

### Prerequisites
* Git
* Python 3.9+
* Docker Desktop (or Docker Engine on Linux)
* `conda` (if using Conda environments)
* Xero Developer Account with an application configured.
* ZRA VSDC API documentation and access details (test environment).

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/zra-xero-integration.git](https://github.com/your-username/zra-xero-integration.git)
    cd zra-xero-integration
    ```

2.  **Create and Activate Python Virtual Environment (using Conda):**
    ```bash
    conda create -n zra_xero_env python=3.9
    conda activate zra_xero_env
    ```

3.  **Install Python Dependencies:**
    ```bash
    # Add conda-forge channel if not already added
    conda config --add channels conda-forge
    conda config --set channel_priority strict

    # Install core dependencies with conda
    conda install flask fastapi uvicorn psycopg2-binary sqlalchemy pytest

    # Install remaining dependencies with pip
    pip install requests xero-python python-dotenv
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project (this file is ignored by Git for security):
    ```
    XERO_CLIENT_ID=your_xero_client_id_here
    XERO_CLIENT_SECRET=your_xero_client_secret_here
    XERO_REDIRECT_URI=http://localhost:5000/callback
    DATABASE_URL=postgresql://user:password@db:5432/mydatabase
    # ZRA_VSDC_API_KEY=your_zra_api_key_here
    ```

5.  **Docker Setup:**
    Ensure `Dockerfile` and `docker-compose.yml` are configured for your application and database services. (These files will be created as you build your application).

6.  **Run the Application Locally:**
    ```bash
    docker compose up --build
    ```
    The application will typically be accessible at `http://localhost:5000`.

## Project Structure (Example)