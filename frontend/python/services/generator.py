import numpy as np
from datetime import datetime, timedelta

class EnergyDataGenerator:
    def __init__(self, start_date=None, _id=89133):
        self.current_time = start_date or datetime.now()
        self._id = _id
        self.previous_row = {
                'Datetime': None,
                'MeterA_ID': None,
                'MeterA_reading':  0,
                'MeterB_ID': None,
                'MeterB_reading':  0,
                'MeterC_ID': None,
                'MeterC_reading':  0,
            }
        self.meter_choice = None
        self.tempered_value = None
        self.unusual_period = None

    def generate_single_reading(self, hour, day):
        if 10 <= hour <= 21:
            if day in ('Saturday', 'Sunday'):
                return np.random.uniform(1.0, 3.8)
            else:
                return np.random.uniform(1.0, 3.5)
        else:
            return np.random.uniform(0.3, 0.8)

    def generate_next(self):
        """
        Method to generate the next row of data.
        """
        
        dt = self.current_time
        hour = dt.hour
        day = dt.strftime("%A")

        if np.random.random() < 0.005 and self.previous_row:  # system failure, return previous row
            print(f"system_failure with {dt}")
            row = self.previous_row.copy()
            row['Datetime'] = dt
        else:
            row = {
                'Datetime': dt,
                'MeterA_ID': f"SMR{self._id}A",
                'MeterA_reading': np.nan_to_num(self.previous_row["MeterA_reading"], nan=0.0) + self.generate_single_reading(hour, day),
                'MeterB_ID': f"SMR{self._id}B",
                'MeterB_reading': np.nan_to_num(self.previous_row["MeterB_reading"], nan=0.0) + self.generate_single_reading(hour, day),
                'MeterC_ID': f"SMR{self._id}C",
                'MeterC_reading': np.nan_to_num(self.previous_row["MeterC_reading"], nan=0.0) + self.generate_single_reading(hour, day),
            }

            # Simulate missing data
            for key in ['MeterA_reading', 'MeterB_reading', 'MeterC_reading']:
                if np.random.random() < 0.0008:
                    row[key] = np.nan

            # Outlier
            if np.random.random() < 0.001:
                meter_choice = np.random.choice(['MeterA_reading', 'MeterB_reading', 'MeterC_reading'])
                if row[meter_choice] is not np.nan:
                    print(f"outlier with {dt}")
                    row[meter_choice] += np.random.choice([3, -5, 5, -3])

            # Load shedding or meter tampering from past rows
            if np.random.random() < 0.004 and not self.meter_choice:
                self.meter_choice = np.random.choice(['MeterA_reading', 'MeterB_reading', 'MeterC_reading'])
                self.tempered_value = np.random.choice([0.0, np.random.uniform(2, 2.2)])
                self.unusual_period = int(np.random.uniform(4, 8)) if self.tempered_value == 0.0 else int(np.random.uniform(24*3, 24*5))

            if self.unusual_period and self.unusual_period > 0:
                if self.tempered_value == 0.0:
                        print(f"load_shedding on {dt}")
                        for key in ['MeterA_reading', 'MeterB_reading', 'MeterC_reading']:
                            row[key] = 0.0
                    
                else:
                    print(f"meter_tempered on {dt}")
                    row[self.meter_choice] = self.tempered_value
                self.unusual_period -= 1

                if self.unusual_period == 0:
                    self.meter_choice = None
                    self.tempered_value = None
                    self.unusual_period = None

        # self._id += 1
        self.current_time += timedelta(hours=1)
        self.previous_row = row
        return row
