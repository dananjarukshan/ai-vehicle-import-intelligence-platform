Main Tables
users
Column	        Type
id	            UUID
name	        TEXT
email	        TEXT
password_hash	TEXT
role	        TEXT

vehicles
Column	        Type
id	            UUID
make	        TEXT
model	        TEXT
year	        INTEGER
mileage	        INTEGER
auction_grade	TEXT
auction_price	NUMERIC
import_cost	    NUMERIC
selling_price	NUMERIC
created_at	    TIMESTAMP

uploads
Column	    Type
id	        UUID
image_url	TEXT
vehicle_id	UUID
uploaded_at	TIMESTAMP
