-- AI Vehicle Import Intelligence Platform
-- Mock vehicle seed data for development and testing
-- Assumption: auction_price values are in JPY.
-- Safe to rerun because fixed UUIDs are upserted.

BEGIN;

INSERT INTO public.vehicles (
    id, make, model, year, mileage, auction_grade, auction_price,
    estimated_import_cost, estimated_selling_price
)
VALUES
    ('11111111-1111-4111-8111-111111111111', 'Toyota', 'Prius', 2019, 85000, '4.5', 1250000, NULL, NULL),
    ('22222222-2222-4222-8222-222222222222', 'Toyota', 'Aqua', 2020, 72000, '4.0', 1150000, NULL, NULL),
    ('33333333-3333-4333-8333-333333333333', 'Toyota', 'Raize', 2022, 34000, '4.5', 1950000, NULL, NULL),
    ('44444444-4444-4444-8444-444444444444', 'Toyota', 'Hilux', 2021, 48000, '4.0', 3600000, NULL, NULL),
    ('55555555-5555-4555-8555-555555555555', 'Toyota', 'Hiace', 2020, 91000, '3.5', 3350000, NULL, NULL),
    ('66666666-6666-4666-8666-666666666666', 'Suzuki', 'Wagon R', 2021, 41000, '4.5', 980000, NULL, NULL),
    ('77777777-7777-4777-8777-777777777777', 'Suzuki', 'Swift', 2019, 63000, '4.0', 1050000, NULL, NULL),
    ('88888888-8888-4888-8888-888888888888', 'Honda', 'Fit', 2018, 65000, '4.0', 950000, NULL, NULL),
    ('99999999-9999-4999-8999-999999999999', 'Honda', 'Vezel', 2020, 56000, '4.5', 1850000, NULL, NULL),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Nissan', 'Note', 2021, 39000, '4.5', 1250000, NULL, NULL),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Nissan', 'X-Trail', 2019, 74000, '4.0', 1750000, NULL, NULL),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Mazda', 'CX-5', 2020, 52000, '4.5', 2100000, NULL, NULL),
    ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Subaru', 'Forester', 2018, 80000, '3.5', 1650000, NULL, NULL),
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Mitsubishi', 'Outlander', 2020, 60000, '4.0', 2050000, NULL, NULL),
    ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Daihatsu', 'Tanto', 2021, 45000, '4.5', 1020000, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
    make = EXCLUDED.make,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    mileage = EXCLUDED.mileage,
    auction_grade = EXCLUDED.auction_grade,
    auction_price = EXCLUDED.auction_price,
    estimated_import_cost = EXCLUDED.estimated_import_cost,
    estimated_selling_price = EXCLUDED.estimated_selling_price;

COMMIT;

-- Verification examples:
-- SELECT COUNT(*) FROM public.vehicles;
-- SELECT * FROM public.vehicles ORDER BY auction_price ASC;
-- SELECT * FROM public.vehicles WHERE make = 'Toyota';
