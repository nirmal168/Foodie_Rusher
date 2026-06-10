def dynamic_price(base_price, demand, rain, rider_shortage):
    multiplier = 1 + (0.1*demand) + (0.05*rain) + (0.08*rider_shortage)
    return round(base_price * multiplier, 2)

print(dynamic_price(200, 2, 1, 1))
