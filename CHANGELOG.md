# Changelog

All notable changes to the DRMC Tech Carnival 2026 project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete backend implementation with Firebase Firestore and Cloud Functions
- Admin panel with authentication and role-based access
- Email notification system for registrations and volunteer applications
- Rate limiting and security features
- Mock data for all 43 segments, schedule, registrations, and volunteers
- Professional project structure with proper documentation
- Environment configuration templates
- Git ignore rules for security

### Changed
- Fixed data inconsistencies in schedule (removed Starbuzz, Celebrity Buzz; added Mega Quiz)
- Updated event timing to 9 AM – 6:30 PM
- Reorganized project structure for better maintainability
- Moved frontend assets to public folder
- Updated image references to use proper asset paths

### Fixed
- Duplicate segment references in schedule
- Inconsistent timing information across the site
- Missing Mega Quiz in schedule

## [1.0.0] - 2026-10-08

### Added
- Initial release of event registration platform
- Responsive frontend with dark/light theme
- Registration form with segment selection
- Volunteer application form
- 7 sectors with 43 segments
- 3-day event schedule
- Interactive 3D card animation
- Search functionality
- Countdown timer
- Mobile-first responsive design

### Features
- Programming (4 segments)
- Robotics (3 segments)
- Showcasing (5 segments)
- Gaming (6 segments)
- Exhibition (5 segments)
- Olympiad & Quiz (13 segments)
- Others (7 segments)

---

**Note**: Version 1.0.0 refers to the initial frontend release. Backend features are being added in upcoming releases.
