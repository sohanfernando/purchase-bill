# Enhanzer Project – Frontend

Angular 22 application for the Enhanzer Full Stack Developer assignment. See the [root README](../README.md) for the complete setup guide.

## Commands

```powershell
npm install
npm start                    # dev server on http://localhost:3000
npm run build                # production build in dist/
npm test -- --watch=false    # unit tests (Vitest)
```

The dev server expects the API on `http://localhost:5000/api` ([src/environments/environment.development.ts](src/environments/environment.development.ts)).

## Structure

```
src/app/
  core/
    auth/        AuthService (session), authGuard / guestGuard, authInterceptor
    http/        API base URL token, API error → user message mapping
    locations/   LocationService (Location_Details)
  shared/
    components/  form-field, autocomplete, spinner, alert
    forms/       custom validators and validation messages
  features/
    login/           login page
    purchase-bill/   page, items table, item summary, service, models, calculations
```

## Notes

- The app is zoneless: component state lives in signals and all components use `OnPush`.
- `app-form-field` shows a field's validation message after it is touched, including messages returned by the API.
- `app-autocomplete` is a keyboard-accessible combobox that works with `formControlName`.
