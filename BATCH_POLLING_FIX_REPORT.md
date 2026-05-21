# Batch Jobs Polling Fix

## Problem
The content quality panel was polling every 4 seconds and could send overlapping requests. Each tick could call both list and detail endpoints, quickly reaching the backend AI prefix limit.

## Frontend fix
- Added an in-flight request guard with `useRef` to prevent overlapping job-status requests.
- Increased active-job polling interval from 4 seconds to 12 seconds.
- Added a user-friendly message when the server returns 429.

## Expected result
Lower request pressure, no duplicate overlapping polling, and better behavior while long AI jobs are running.
