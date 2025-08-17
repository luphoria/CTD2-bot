# Classic Tetris Match Scheduler
This bot is intended for potential usage in improving Classic Tetris stream scheduling. One player will schedule a match, and any interested parties (i.e. opponents, viewers, and restreamers) can join the event (to be notified an hour before the event).
 - !scheduleMatch
  * Creates a match event with you as the owner and provides an event ID. 
  * Example: `!scheduleMatch 2025-8-15 21:30 CDT Match with me and @arbaro -- restreamer still needed`
  * Command format: `!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]`
 - !event
  * Shows all relevant details for a scheduled event.
  * Command format: `!event [event ID]`
 - !join
  * Adds you to an event. This means you'll be notified before the event begins.
  * To add yourself as the event's restreamer, append `restreamer` to the end of the command. If you are not, you don't need to add anything.
  * Command format: `!join [event ID] {restreamer?}`
 - !leave
  * Removes you from an event. **If there is nobody left after you leave, the event is automatically deleted.**
  * Command format: `!leave [event ID]`
 - !today
  * Lists every event happening within the next 24 hours.
  * Command format: `!today`
 - !help
  * Destroys the world and everything living within it.
  * Command format: `!help`

## todo
- Error handling / persistence
- Better keywords and naming consistency
- Add delete to command list (the functionality is already written)
- more config
- Add more features to notifier