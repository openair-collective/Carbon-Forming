<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template -->
<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Carbon Forming Competition Platform</h3>

  <p align="center">
    A platform to support the evolution of distributed DIY carbon removal technology though monthly competition and collaboration.
    <br />
    ·
    <a href="https://github.com/openair-collective/Carbon-Forming/issues">Report Bug</a>
    ·
    <a href="https://github.com/openair-collective/Carbon-Forming/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

A platform to support the evolution of distributed DIY carbon removal technology though monthly competition and collaboration.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Vite][Vite]][Vite-url]
* [![Vue][Vue.js]][Vue-url]
* [![Firebase][Firebase]][Firebase-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

#### Node & NVM

Our current version of [Vite][Vite-url] requires a Node version of **v18.6.0**.

[Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) is reccomended for managing your local node installations. A `.nvmrc` file is located at the root of the project.

#### Discord

We use the Discord [OAuth2](https://discord.com/developers/docs/topics/oauth2) authoriation system to authenticate OpenAir server users and access API data on their behalf.

For local development, you will want to [create a new test Application](https://discord.com/developers/docs/getting-started#creating-an-app) within the Discord [Developer Portal](https://discord.com/developers/applications). A Discord account is required.

#### Firebase

Our application has been desinged for deployment on the [Firebase app development](https://firebase.google.com) platform. The Firebase services that are currently used are:

* [Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart)
* [Authentication for Web](https://firebase.google.com/docs/auth/web/start)
* [Cloud Storage for Web](https://firebase.google.com/docs/storage/web/start)

For local development, you will want to [create a new Project](https://firebase.google.com/docs/web/setup?authuser=0&hl=en#create-firebase-project-and-app) within the Firebase [Console](https://console.firebase.google.com/). A Google account is required.

#### Java

Firebase emulators require [Java](https://www.oracle.com/java/technologies/downloads) JDK version 11 or higher.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/openair-collective/Carbon-Forming.git
   ```
1. Install NPM packages
   ```sh
   npm install
   ```
1. Copy and update your Environment Variable files ([Read Docs](https://github.com/openair-collective/Carbon-Forming/wiki/Environment-Variables))
   ```sh
   cp .sample.env > .env.local
   cp ./functions/.sample.secret.local > ./functions/secret.local
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

### Running the Development Server

Run these these two commands in seperate terminal instances

1. Run the Vite project in development mode
   ```sh
    npm run dev
   ```
1. Run the Firebase emulators
   ```sh
    npx run firebase emulators:start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

TBD

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

TBD

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS -->
[contributors-shield]: https://img.shields.io/github/contributors/openair-collective/Carbon-Forming
[contributors-url]: https://github.com/openair-collective/Carbon-Forming/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/openair-collective/Carbon-Forming
[forks-url]: https://github.com/openair-collective/Carbon-Forming/network/members
[stars-shield]: https://img.shields.io/github/stars/openair-collective/Carbon-Forming
[stars-url]: https://github.com/openair-collective/Carbon-Forming/stargazers
[issues-shield]: https://img.shields.io/github/issues/openair-collective/Carbon-Forming
[issues-url]: https://github.com/openair-collective/Carbon-Forming/issues
[Firebase]: https://img.shields.io/badge/firebase-35495E?style=for-the-badge&logo=firebase&logoColor=FFCA28
[Firebase-url]: https://firebase.google.com/
[Vite]: https://img.shields.io/badge/vitejs.dev-35495E?style=for-the-badge&logo=vite&logoColor=646CFF
[Vite-url]: https://vitejs.dev/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/

