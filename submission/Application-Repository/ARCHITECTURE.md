# AI Task Processing Platform – Architecture Document

## 1. Executive Summary
The AI Task Processing Platform is a scalable, distributed web application designed to handle asynchronous tasks securely and efficiently. Built with a modern microservices architecture, it separates user-facing operations from heavy background processing, ensuring a highly responsive user experience. The platform is designed to handle high volumes of tasks (upwards of 100k tasks/day) with robust queue management, real-time status updates, and a production-grade infrastructure pipeline using Docker, Kubernetes, and Argo CD.

## 2. High-Level System Architecture & Data Flow

The system is composed of four primary components:
1. **Frontend Client**: A React-based SPA.
2. **Backend API**: A Node.js/Express REST API.
3. **Task Queue & State**: Redis and MongoDB.
4. **Worker Process**: A Python background daemon.

```mermaid
graph TD
    User([User]) -->|HTTP/REST| Frontend[Frontend (React + Nginx)]
    Frontend -->|HTTP/REST| Backend[Backend API (Node.js)]
    
    Backend -->|Read/Write| MongoDB[(MongoDB)]
    Backend -->|Push Job| Redis[(Redis Queue)]
    
    Worker[Python Worker] -->|Pop Job| Redis
    Worker -->|Update Status/Logs| MongoDB
```

### Data Flow Lifecycle:
1. **Authentication**: The user logs in via the Frontend, which hits the Backend API. The API validates credentials against MongoDB and issues a JWT.
2. **Task Submission**: The user submits a new task. The Backend saves a `Pending` task document in MongoDB and pushes a job containing the `taskId` onto the Redis queue.
3. **Asynchronous Processing**: The Python Worker continuously polls Redis. Once a job is detected, it pops it off the queue, updates the MongoDB task state to `Running`, executes the requested operation (e.g., Uppercase, Word Count), and streams logs.
4. **Completion**: Upon finishing, the Worker updates the MongoDB task state to `Success` (or `Failed`) and saves the final result.
5. **Real-time Polling**: The Frontend periodically polls the Backend to fetch the latest task state, updating the UI seamlessly.

---

## 3. Component Details

### 3.1 Frontend (React, Vite, Tailwind CSS)
*   **Framework**: Built with React 18 and bundled using Vite for instantaneous HMR and optimized production builds.
*   **State Management**: React Context API is utilized to globally manage User Authentication and Toast Notifications.
*   **Aesthetic**: Designed with a "Cyberpunk Command Center" theme utilizing Tailwind CSS glassmorphism, custom CSS animations, and floating label inputs.
*   **Networking**: Axios interceptors automatically inject the JWT into the Authorization header and handle 401 Unauthorized fallbacks.

### 3.2 Backend (Node.js, Express)
*   **Architecture**: Follows an MVC-inspired layered architecture (`Routes` -> `Controllers` -> `Models`).
*   **Security**: Implements JWT-based authentication, bcrypt password hashing, and express-rate-limit to prevent brute-force attacks.
*   **Database**: Uses Mongoose to define strict schemas for `User` and `Task` entities.
*   **Queue Management**: Uses the `redis` library to push task IDs onto a `task_queue` list using `LPUSH`.

### 3.3 Worker (Python)
*   **Design**: A headless daemon process running in an infinite loop, connected directly to Redis and MongoDB.
*   **Queueing**: Utilizes `brpop` (Blocking Right Pop) on Redis, meaning the worker sleeps efficiently until a task is available, consuming zero idle CPU.
*   **Error Handling**: Wraps task execution in robust `try/except` blocks. If an operation crashes, the worker intercepts the exception, updates the task state to `Failed`, and logs the stack trace to the task document so the user can debug it on the Frontend.

---

## 4. Infrastructure & GitOps Workflow

The platform utilizes a modern DevOps infrastructure strategy, encapsulating the entire environment in containerized workloads.

### 4.1 Containerization
All components are Dockerized using **Multi-Stage Builds**:
*   The **Frontend** builds the React app using Node.js and serves the static output using a lightweight `nginx:alpine` image.
*   The **Backend** installs only production dependencies in the final stage to reduce image size and attack surface.
*   The **Worker** uses `python:3.11-slim`, installing only the required wheels.

### 4.2 Kubernetes Orchestration
The application is deployed using Kubernetes to guarantee high availability and self-healing.
*   **Deployments**: The API and Worker are deployed as scalable ReplicaSets.
*   **Services**: ClusterIP services expose the Backend and databases internally.
*   **ConfigMaps & Secrets**: Environment variables and database URIs are decoupled from the codebase using Kubernetes ConfigMaps.

### 4.3 Continuous Delivery (Argo CD)
The infrastructure embraces GitOps principles using **Argo CD**.
1.  All Kubernetes YAML manifests are stored in the `/infra/k8s` directory.
2.  Argo CD continuously monitors this directory.
3.  Any changes pushed to the `main` branch (e.g., updating an image tag) are automatically detected and synced to the Kubernetes cluster by Argo CD, completely removing the need for manual `kubectl apply` commands.

---

## 5. Scalability & Future Considerations

*   **Horizontal Scaling**: The Python Worker and Node.js Backend are completely stateless. As the queue grows, we can horizontally scale the Worker pods (`kubectl scale deployment ai-task-worker --replicas=5`) to increase throughput linearly.
*   **Redis Enhancements**: For a massive scale, the current basic List queue can be migrated to Redis Streams or Celery/BullMQ for at-least-once delivery guarantees and dead-letter queues.
*   **WebSockets**: The current 3-second polling mechanism in the Frontend can be upgraded to WebSockets (via Socket.io) for true real-time log streaming without HTTP overhead.
