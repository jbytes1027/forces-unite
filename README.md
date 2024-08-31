# Forces Unite

Forces Unite is a matchmaking platform for gamers to find players and make friends. It was developed as group project for a capstone class.

## Notable Contributions
- Developed the [avatar image uploading system](https://github.com/jbytes1027/forces-unite/tree/main/FU.API#avatar-image-system-overview).
- [Designed](https://github.com/SCCapstone/PalmettoProgrammers/wiki/Design#discovery-page) and [implemented](https://nice-sand-06eb0990f.5.azurestaticapps.net/discover) the core of the search API and UI.
- Containerized the API, SPA, Blob Storage, and database for testing.
- Created the [landing page](https://nice-sand-06eb0990f.5.azurestaticapps.net/) and [showcase video](https://www.youtube.com/watch?v=jp-dW9j6vXE).
- [Researched competitors](https://github.com/SCCapstone/PalmettoProgrammers/wiki/Competitive-Analysis) to clarify the focus and features of the site.


## Demo

The site is live at <https://nice-sand-06eb0990f.5.azurestaticapps.net>. Use `user1` with password `pass_word1` to login, or create a new account.

## Tech

- Backend
  - ASP.NET
  - [xUnit](https://xunit.net/)
  - [SignalR](https://github.com/SignalR/SignalR)
  - [SkiaSharp](https://github.com/mono/SkiaSharp)
  - EFCore
- Tools & Services
  - Azure App Services
  - Azure Static Web Apps
  - Azure Communication Services
  - Azure Blob Storage
  - GitHub Actions
  - Postgres
  - Docker
- Frontend
  - [React](https://react.dev/)
  - [MUI](https://mui.com/)
  - [Selenium](https://www.selenium.dev/)
  - [Vite](https://vitejs.dev/)

## Screenshots

![Find posts](FU.SPA/assets/discover-posts-view.png)

![Create a post](FU.SPA/assets/create-post-view.png)

![Link Up with others](FU.SPA/assets/post-view.png)

![Befriend others](FU.SPA/assets/friends-view.png)

## Showcase Video

[![Watch the showcase](https://img.youtube.com/vi/jp-dW9j6vXE/0.jpg)](https://www.youtube.com/watch?v=jp-dW9j6vXE)

## Contributing

See `FU.SPA/README.md` and `FU.API/README.md` for more details.

## Running

After installing [npm](https://www.npmjs.com/package/npm) and [Docker](https://www.docker.com/get-started/), run `npm run container-setup` in `FU.SPA` to start the project. By default the site URL is `http://localhost:5173`. To stop, run `npm run container-teardown`.

## Authors

Aaron Keys \<<alkeys@email.sc.edu>\>

Ethan Adams \<<epadams@email.sc.edu>\>

Evan Scales \<<escales@email.sc.edu>\>

Jackson Williams \<<JRW30@email.sc.edu>\>

James Pretorius \<<pretorj@email.sc.edu>\>
