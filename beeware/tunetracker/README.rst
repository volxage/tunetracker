Tune Tracker
============

This is the BeeWare (via Python) implementation of the program. The benefit of this approach is that after some minimal configuration the program can be packaged for Android, iOS, MacOS, Windows, and Linux! The downside is that the code needs to be very general and high-level. Lower-level tweaking of BeeWare's UI (Toga) for a single platform would require raising an issue on BeeWare's GitHub (which I have had to do at one point) or even forking Toga and making modifications there and packaging that fork for TuneTracker, which should definitely be avoided.
