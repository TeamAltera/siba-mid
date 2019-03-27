
CREATE TABLE ap
(
	state                boolean NULL,
	MAC                  CHAR(17) NOT NULL
);



ALTER TABLE ap
ADD PRIMARY KEY (MAC);



CREATE TABLE dev
(
	dev_MAC              CHAR(17) NOT NULL,
	cur_ip               VARCHAR(15) NULL,
	dev_type             VARCHAR(30) NULL,
	MAC                  CHAR(17) NOT NULL
);



ALTER TABLE dev
ADD PRIMARY KEY (dev_MAC);



CREATE TABLE hub
(
	MAC                  CHAR(17) NOT NULL,
	cur_ip               VARCHAR(15) NULL,
	prev_ip              VARCHAR(15) NULL,
	upnp_port            INTEGER NULL,
	is_reg               boolean NULL,
	reg_date             DATE NULL
);



ALTER TABLE hub
ADD PRIMARY KEY (MAC);



CREATE TABLE rf
(
	state                boolean NULL,
	MAC                  CHAR(17) NOT NULL
);



ALTER TABLE rf
ADD PRIMARY KEY (MAC);



CREATE TABLE user
(
	id                   INTEGER NOT NULL,
	role_type            VARCHAR(5) NULL,
	MAC                  CHAR(17) NOT NULL
);



ALTER TABLE user
ADD PRIMARY KEY (id);



ALTER TABLE ap
ADD FOREIGN KEY R_1 (MAC) REFERENCES hub (MAC);



ALTER TABLE dev
ADD FOREIGN KEY R_4 (MAC) REFERENCES hub (MAC);



ALTER TABLE rf
ADD FOREIGN KEY R_2 (MAC) REFERENCES hub (MAC);



ALTER TABLE user
ADD FOREIGN KEY R_3 (MAC) REFERENCES hub (MAC);


