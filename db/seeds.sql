INSERT INTO department (name)
VALUES 
    ('Management'),
    ('Sales'),
    ('Production'),

INSERT INTO role (title, salary, department_id)
VALUES 
    ('Manager', 85000, 1),
    ('CEO', 250000 , 1),
    ('Salesman', 65000, 2),
    ('FactoryWorker',32000,3),


INSERT INTO Employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Elaine','Benes',1,NULL)
    ('Art.','Vandelay',2,NULL)
    ('George','Costanza',3,NULL)
    ('Cosmo','Kramer',4,NULL)