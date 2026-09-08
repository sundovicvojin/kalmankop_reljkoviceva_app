--
-- PostgreSQL database dump
--

\restrict XO5ptdfNjXaGRoI5ksx6nBVbItJ1UsHjWvlhjDCxRIOwvAMGyOtbeLHg2blDQjU

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ApartmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApartmentStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'SOLD'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Apartment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Apartment" (
    id text NOT NULL,
    "externalId" text NOT NULL,
    number text NOT NULL,
    floor text NOT NULL,
    structure text NOT NULL,
    "totalArea" numeric(7,2) NOT NULL,
    status public."ApartmentStatus" DEFAULT 'AVAILABLE'::public."ApartmentStatus" NOT NULL,
    "floorplanUrl" text,
    "brochureUrl" text,
    "interiorUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ApartmentRoom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApartmentRoom" (
    id text NOT NULL,
    "apartmentId" text NOT NULL,
    name text NOT NULL,
    area numeric(7,2) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Apartment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Apartment" (id, "externalId", number, floor, structure, "totalArea", status, "floorplanUrl", "brochureUrl", "interiorUrl", "createdAt", "updatedAt") FROM stdin;
cmtj0ebkq0000tss08eor70os	APT_01	01	Prizemlje	dvosoban	54.80	AVAILABLE	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-01.pdf	\N	2026-09-01 18:37:03.386	2026-09-01 18:37:03.386
cmtj0ebkz0004tss0xrt9uysl	APT_02	02	Prizemlje	trosoban	72.35	RESERVED	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-02.pdf	\N	2026-09-01 18:37:03.395	2026-09-01 18:37:03.395
cmtj0ebl30008tss0xthrd8uj	APT_03	03	I sprat	dvosoban	64.20	AVAILABLE	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-03.pdf	https://kalmankop.rs/reljkoviceva-59/stan-03	2026-09-01 18:37:03.399	2026-09-01 18:37:03.399
cmtj0ebl7000ctss0wbq76sth	APT_04	04	I sprat	cetvorosoban	91.10	SOLD	/floorplans/apartment-placeholder.svg	\N	\N	2026-09-01 18:37:03.403	2026-09-01 18:37:03.403
cmtj0ebla000gtss0pliam0mg	APT_05	05	II sprat	trosoban	76.45	AVAILABLE	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-05.pdf	https://kalmankop.rs/reljkoviceva-59/stan-05	2026-09-01 18:37:03.406	2026-09-01 18:37:03.406
cmtj0ebld000ktss0x5u9lzhz	APT_06	06	II sprat	dvosoban	58.90	RESERVED	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-06.pdf	\N	2026-09-01 18:37:03.409	2026-09-01 18:37:03.409
cmtj0eblg000otss0n6qrcytu	APT_07	07	III sprat	trosoban	80.15	AVAILABLE	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-07.pdf	\N	2026-09-01 18:37:03.412	2026-09-01 18:37:03.412
cmtj0eblk000stss009cii1jq	APT_08	08	III sprat	cetvorosoban	96.60	SOLD	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-08.pdf	\N	2026-09-01 18:37:03.416	2026-09-01 18:37:03.416
cmtj0ebln000wtss0zacnluil	APT_09	09	Povuceni sprat	trosoban	84.25	AVAILABLE	/floorplans/apartment-placeholder.svg	https://kalmankop.rs/brosure/reljkoviceva-59-stan-09.pdf	https://kalmankop.rs/reljkoviceva-59/stan-09	2026-09-01 18:37:03.419	2026-09-01 18:37:03.419
\.


--
-- Data for Name: ApartmentRoom; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApartmentRoom" (id, "apartmentId", name, area, "sortOrder") FROM stdin;
cmtj0ebkt0001tss0ri88etbd	cmtj0ebkq0000tss08eor70os	Dnevna zona	24.00	1
cmtj0ebkt0002tss0z884ta8o	cmtj0ebkq0000tss08eor70os	Spavaca soba	12.40	2
cmtj0ebkt0003tss0nlwndhky	cmtj0ebkq0000tss08eor70os	Kupatilo	5.10	3
cmtj0ebl00005tss07enhd331	cmtj0ebkz0004tss0xrt9uysl	Dnevna zona	24.00	1
cmtj0ebl00006tss0k2wax9mz	cmtj0ebkz0004tss0xrt9uysl	Spavaca soba	12.40	2
cmtj0ebl00007tss0flpmbpli	cmtj0ebkz0004tss0xrt9uysl	Kupatilo	5.10	3
cmtj0ebl40009tss0ae44wats	cmtj0ebl30008tss0xthrd8uj	Dnevna zona	24.00	1
cmtj0ebl4000atss0t9um7mf6	cmtj0ebl30008tss0xthrd8uj	Spavaca soba	12.40	2
cmtj0ebl4000btss0yjr97ft5	cmtj0ebl30008tss0xthrd8uj	Kupatilo	5.10	3
cmtj0ebl7000dtss0jy054is2	cmtj0ebl7000ctss0wbq76sth	Dnevna zona	24.00	1
cmtj0ebl7000etss08j6avqeh	cmtj0ebl7000ctss0wbq76sth	Spavaca soba	12.40	2
cmtj0ebl7000ftss04xjio8gu	cmtj0ebl7000ctss0wbq76sth	Kupatilo	5.10	3
cmtj0eblb000htss07q1y2400	cmtj0ebla000gtss0pliam0mg	Dnevna zona	24.00	1
cmtj0eblb000itss046covaq1	cmtj0ebla000gtss0pliam0mg	Spavaca soba	12.40	2
cmtj0eblb000jtss0ljqtz0ub	cmtj0ebla000gtss0pliam0mg	Kupatilo	5.10	3
cmtj0eble000ltss0dmk9i1xu	cmtj0ebld000ktss0x5u9lzhz	Dnevna zona	24.00	1
cmtj0eble000mtss0p1x9l94f	cmtj0ebld000ktss0x5u9lzhz	Spavaca soba	12.40	2
cmtj0eble000ntss0kvggnu2e	cmtj0ebld000ktss0x5u9lzhz	Kupatilo	5.10	3
cmtj0eblh000ptss0asdvz83e	cmtj0eblg000otss0n6qrcytu	Dnevna zona	24.00	1
cmtj0eblh000qtss045rf5qvx	cmtj0eblg000otss0n6qrcytu	Spavaca soba	12.40	2
cmtj0eblh000rtss0mujzo5vv	cmtj0eblg000otss0n6qrcytu	Kupatilo	5.10	3
cmtj0eblk000ttss0u8ydvml9	cmtj0eblk000stss009cii1jq	Dnevna zona	24.00	1
cmtj0eblk000utss0b7el8tgt	cmtj0eblk000stss009cii1jq	Spavaca soba	12.40	2
cmtj0eblk000vtss0n95o9uhv	cmtj0eblk000stss009cii1jq	Kupatilo	5.10	3
cmtj0eblo000xtss0549nuoyw	cmtj0ebln000wtss0zacnluil	Dnevna zona	24.00	1
cmtj0eblo000ytss09jhlntxq	cmtj0ebln000wtss0zacnluil	Spavaca soba	12.40	2
cmtj0eblo000ztss0s657ecn1	cmtj0ebln000wtss0zacnluil	Kupatilo	5.10	3
\.


--
-- Name: ApartmentRoom ApartmentRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApartmentRoom"
    ADD CONSTRAINT "ApartmentRoom_pkey" PRIMARY KEY (id);


--
-- Name: Apartment Apartment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Apartment"
    ADD CONSTRAINT "Apartment_pkey" PRIMARY KEY (id);


--
-- Name: ApartmentRoom_apartmentId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApartmentRoom_apartmentId_sortOrder_idx" ON public."ApartmentRoom" USING btree ("apartmentId", "sortOrder");


--
-- Name: Apartment_externalId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Apartment_externalId_key" ON public."Apartment" USING btree ("externalId");


--
-- Name: Apartment_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Apartment_number_idx" ON public."Apartment" USING btree (number);


--
-- Name: Apartment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Apartment_status_idx" ON public."Apartment" USING btree (status);


--
-- Name: ApartmentRoom ApartmentRoom_apartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApartmentRoom"
    ADD CONSTRAINT "ApartmentRoom_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES public."Apartment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict XO5ptdfNjXaGRoI5ksx6nBVbItJ1UsHjWvlhjDCxRIOwvAMGyOtbeLHg2blDQjU

