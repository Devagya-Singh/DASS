# Dynamic Academic Submission System (DASS)

## Overview
**Dynamic Academic Submission System (DASS)** is an intuitive and efficient platform designed to streamline the process of research paper submissions for authors and conference organizers. The system offers a seamless experience for submitting, reviewing, and managing research articles, ensuring a smooth workflow from submission to publication.

## Features
- **User-Friendly Submission Portal:** Simplifies the submission process for authors.
- **Automated Review Management:** Facilitates easy assignment and tracking of peer reviews.
- **Real-Time Status Updates:** Authors and reviewers receive instant updates on submission statuses.
- **Secure Data Handling:** Ensures confidentiality and integrity of submitted articles.
- **Customizable Conference Settings:** Organizers can tailor submission guidelines and review processes.
- **Notification System:** Automated email alerts for deadlines, submission confirmations, and review feedback.

## Technology Stack
- **Frontend:** React.js, Bootstrap CSS
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** AWS S3 or local server storage
- **Deployment:** Hosted on GitHub Pages / AWS / Heroku

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/DASS.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd DASS
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and add necessary configurations:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
   ```

5. **Run the application:**
   ```bash
   npm start
   ```

## Usage
1. **For Authors:**
   - Register and log in to the system.
   - Submit articles through the submission portal.
   - Track the status of your submissions.

2. **For Reviewers:**
   - Access assigned articles for review.
   - Submit feedback and recommendations.

3. **For Organizers:**
   - Manage submissions and assign reviewers.
   - Customize conference settings and submission guidelines.
   - Monitor the review process and communicate with authors.

## Contributors
- **Devagya Singh** *(Project Lead)*  
- Swaralipi  
- Sampurna  
- Deebleena  
- Adrija  
- Ankita

## Future Enhancements
- Integration with plagiarism detection tools.
- Advanced analytics dashboard for organizers.
- Multi-language support.
- Mobile application for on-the-go access.

## License
This project is protected under copyright law. All rights reserved.

## Contact
For any queries or support, please contact:  
**Devagya Singh**  
devagyarupsingh@gmail.com

---
*Empowering researchers and organizers with a dynamic submission experience.*

