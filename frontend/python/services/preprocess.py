import pandas as pd
from sklearn.impute import KNNImputer

def data_cleaning(df, timestamp_col="Datetime", meter_cols=['MeterA_reading', 'MeterB_reading', 'MeterC_reading']):

    """
    Function to remove duplicates, outliers, null values and impute them

    Input: 
        df : Uncleaned Dataframe
        timestamp_col : Name of the timestamp column in the dataframe. Default value is 'Datetime'
        meter_cols : List of names of the columns of meter readings. Default value is ['MeterA_reading', 'MeterB_reading', 'MeterC_reading']

    Output: Cleaned Dataframe
    """

    df = df.dropna(subset=[timestamp_col])
    df = df.sort_values(by=timestamp_col)
    duplicate_mask = df.duplicated(subset=[timestamp_col] + meter_cols, keep='first')
    df.loc[duplicate_mask, meter_cols] = float('nan')

    Q1 = df[meter_cols].quantile(0.25)
    Q3 = df[meter_cols].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outlier_mask = (df[meter_cols] < lower_bound) | (df[meter_cols] > upper_bound)
    for i in range(len(meter_cols)):
        df.loc[outlier_mask.iloc[:,i], meter_cols[i]] = float('nan')

    required_df = df[['MeterA_reading', 'MeterB_reading', 'MeterC_reading']]
    imputer = KNNImputer(n_neighbors=5)
    data_imputed = imputer.fit_transform(required_df)
    df.drop(columns=['MeterA_reading', 'MeterB_reading', 'MeterC_reading'], inplace=True)
    cleaned_df = pd.concat([pd.DataFrame(data_imputed, columns=['MeterA_reading', 'MeterB_reading', 'MeterC_reading']), df], axis=1)
    new_order = ['Datetime', 'MeterA_ID', 'MeterA_reading', 'MeterB_ID', 'MeterB_reading', 'MeterC_ID', 'MeterC_reading']
    cleaned_df = cleaned_df[new_order]

    return cleaned_df
