import cv2
from ultralytics import YOLO

def count_vehicles(video_path: str) -> int:
    """
    Processes the first 10 seconds of a video, tracks unique vehicles 
    (cars, motorcycles, buses, trucks), and returns an estimated 
    vehicles per minute count.
    """
    # Load the pre-trained YOLOv8 nano model
    model = YOLO("yolov8n.pt")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return 0

    # Get Frames Per Second (FPS) to calculate exactly 10 seconds
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0 or fps != fps: # Fallback if fps cannot be read
        fps = 30.0
        
    max_frames = int(fps * 10) # 10 seconds limit
    
    unique_ids = set()
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        
        # Stop if video ends or we reach 10 seconds
        if not ret or frame_count >= max_frames:
            break
            
        # Run YOLOv8 tracking. 
        # persist=True keeps tracker memory across frames.
        # classes=[2, 3, 5, 7] filters to car, motorcycle, bus, and truck respectively.
        results = model.track(frame, persist=True, classes=[2, 3, 5, 7], verbose=False)
        
        # If objects are detected and assigned a tracking ID
        if results[0].boxes is not None and results[0].boxes.id is not None:
            # Extract tracking IDs as a list of ints
            track_ids = results[0].boxes.id.int().cpu().tolist()
            
            # Add to set (sets automatically handle uniqueness)
            for track_id in track_ids:
                unique_ids.add(track_id)
                
        frame_count += 1
        
    cap.release()
    
    total_unique_vehicles = len(unique_ids)
    
    # Since we only analyzed 10 seconds, we multiply by 6 to estimate the vehicles per minute
    vehicles_per_minute = total_unique_vehicles * 6
    
    return vehicles_per_minute

if __name__ == "__main__":
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    video_file = os.path.join(current_dir, "traffic.mp4")
    print(f"Initializing YOLOv8 tracking on '{video_file}' (processing first 10s)...")
    vpm = count_vehicles(video_file)
    print(f"Total Unique Vehicles seen in 10s: {vpm // 6}")
    print(f"Estimated Vehicles Per Minute (vpm): {vpm}")
