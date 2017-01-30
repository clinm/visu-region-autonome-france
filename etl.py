import csv
import json
import os
import argparse


def create_parser():
    p = argparse.ArgumentParser(description="ETL for all region on production and consumption")

    p.add_argument('output_file',
                   help='Result json file will be written in this file')

    return p


def extract_data_source(file_path):
    """
        newline=''
        delimiter='\t'
    :param file_path: must be a csv file
    :return: list First dim is row, second one is column
    """
    print("Extracting {}".format(os.path.basename(file_path)))

    with open(file_path, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter='\t')
        content = list(reader)

    return content


def transform(data_prod, data_conso):
    """
    Structure :
    [
        {
            "year": "1990",
            "regions": [
                    {
                        "name": "ALSACE",
                        "prod": 3008.0,
                        "cons": 4323.0,
                        "diff": -1315.0
                    },
                    ...
                    ]
        },
        ...
    ]

    :param data_prod:
    :param data_conso:
    :return:
    """
    print("Transforming data")

    # region's name is stored into 'col_region' column
    col_region = 0
    # beginning of value linked to a date
    col_begin_date = 4

    years = []
    for id, year in enumerate(data_conso[0][col_begin_date:]):
        col_data = col_begin_date + id
        regions = []
        for region_id, region in enumerate(data_conso[1:len(data_conso)-2]):
            row_data = region_id + 1
            cons = float(region[col_data])
            prod = float(data_prod[row_data][col_data])

            data_region = {
                "name": region[col_region],
                "prod": prod,
                "cons": cons,
                "diff": prod - cons
            }
            regions.append(data_region)

        data_year = {
            "year": year,
            "regions": regions
        }

        years.append(data_year)

    return years


def load(output_file, content):
    """
        Writes everything in the output_file
    :param output_file: file_path
    :param content: written as json
    :return: None
    """
    print("Loading data into {}".format(output_file))

    with open(output_file, "w") as output:
        output.writelines(json.dumps(content))

if __name__ == '__main__':
    args = create_parser().parse_args()
    print(args)

    conso = extract_data_source('datasource/conso_totale_petrole.csv')
    prod = extract_data_source('datasource/prod_totale_petrole.csv')

    data = transform(prod, conso)

    load(args.output_file, data)
