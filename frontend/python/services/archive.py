import pandas as pd
import os

def create_dirs(path):
    if not os.path.exists(path):
        os.makedirs(path)

def save_weekwise_data(df):
    # Create the base Archive directory
    base_dir = 'data/Archive'
    create_dirs(base_dir)
    if df['Datetime'].dtype == 'O':
        df['Datetime'] = pd.to_datetime(df['Datetime'])

    # Extract year and month from the 'Datetime' column for folder organization
    for year in df['Datetime'].dt.year.unique():
        year_dir = os.path.join(base_dir, str(year))
        create_dirs(year_dir)
        
        for month in df[df['Datetime'].dt.year == year]['Datetime'].dt.month.unique():
            month_dir = os.path.join(year_dir, f"{month:02d}")
            create_dirs(month_dir)
            
            # Filter data for the specific year and month
            month_data = df[(df['Datetime'].dt.year == year) & (df['Datetime'].dt.month == month)]
            
            # Iterate through each week in the month
            for week_num, week_data in month_data.groupby(month_data['Datetime'].dt.isocalendar().week):
                # week_dir = os.path.join(month_dir, f"week_{week_num}")
                # create_dirs(week_dir)
                
                # Save the week data to a CSV file
                week_csv_path = os.path.join(month_dir, f"week_{week_num}.csv")
                week_data.to_csv(week_csv_path, index=False)
                print(f"Saved: {week_csv_path}")

