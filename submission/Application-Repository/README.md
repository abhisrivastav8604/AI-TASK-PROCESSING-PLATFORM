# AI Task Processing Platform

A production-ready, distributed task processing platform featuring a sleek Cyberpunk-themed React dashboard, a highly secure Node.js backend, and a scalable Python background worker.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, React Router
- **Backend**: Node.js, Express.js, JWT Authentication
- **Worker**: Python 3.11, PyMongo, Redis
- **Database & Cache**: MongoDB 6.0, Redis 7.0
- **Infrastructure**: Docker, Docker Compose, Kubernetes, Argo CD

---

## 💻 Local Setup (Docker Compose)

The easiest way to run the entire platform locally is using Docker Compose. This single command will build the frontend, backend, worker, and automatically provision the databases.

### Prerequisites
- Docker Engine & Docker Desktop
- Docker Compose

### Running the App
1. Clone the repository and navigate to the root folder:
   ```bash
   git clone <your-repo-url>
   cd ai-task-platform
   ```
2. Start the cluster in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. **Access the Platform:**
   Open your browser and navigate to **http://localhost:3000**
   *Note: The backend API runs on port 5000, MongoDB on 27017, and Redis on 6379.*

---

## 🚢 Kubernetes & GitOps Setup (Argo CD)

For a production-grade deployment, this repository includes Kubernetes manifests ready for GitOps synchronization via Argo CD.

### Prerequisites
- Minikube (or any K8s cluster)
- `kubectl` configured

### Deployment Steps
1. **Start Minikube**:
   ```bash
   minikube start
   ```
2. **Install Argo CD**:
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
3. **Apply the Application Manifest**:
   Update the `repoURL` in `infra/argocd/application.yaml` to point to your Git repository, then apply it:
   ```bash
   kubectl apply -f infra/argocd/application.yaml
   ```
4. **Access the App**:
   Once Argo CD syncs the resources, you can port-forward the frontend service:
   ```bash
   kubectl port-forward svc/ai-task-frontend 3000:80
   ```

---

## 📂 Project Structure

*   `/frontend` - React Dashboard with custom CSS keyframes and glassmorphism UI.
*   `/backend` - Express API with strict MVC architecture and error handling.
*   `/worker` - Python daemon connecting to Redis queue via blocking pops.
*   `/infra` - Kubernetes deployments, services, ConfigMaps, and ArgoCD manifests.

## 📄 Architecture Documentation
For a deep dive into the system design, data flow, and scalability considerations, please read the [Architecture Document (ARCHITECTURE.md)](./ARCHITECTURE.md).
