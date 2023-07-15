# Dipsi

Easyly project deployment to the cloud

### Synopsis 

It is a simple and easy-to-use project deployment management tool. You can use this tool to transfer projects between hosts like git, but it's not that complex.

### Motivation 
Recently we've been using git as a tool to deploy our projects to the cloud. But for our small project implementation use, it is too complicated, we want something easy. Then we looked at firebase and npm they are very easy to use but... they can't be used on a private host like git. It is from this reason that we developed a simple project which we named Dipsi. Flexible like git and easy like firebase

### Installing 

This tools is require ```nodejs``` instalked on your machine

```bash
# install using npm
$ npm i -g dipsi

# using yarn
$ yarn add --global dipsi

```

### Running

```bash
# running server
$ dipsi run
Server running...
```

### Usage

Initialize your remote repos.
After initialize is successfull it will save your credentials and print the projectId

```bash
$ mkdir myrepos
$ cd myrepos
$ dipsi init --srv
```

On your local machine use your credentials and project id for Authorizing

```bash
$ cd /path/to/your-project
$ dipsi init
```

Now you can do deploy and fetch your project

```bash
# deploying
$ dipsi deploy

# fetching
# cd into your other directory
$ dipsi fetch http://your_host/projectId
```

# Donation
Jika proyek ini bermanfaat buat kamu. Kamu bisa memberi donasi kepada kami melalui link berikut ini:

[DANA Indonesia](https://link.dana.id/qr/pg2s31bz)

Donasi dari kamu akan sangat bermanfaat buat kami agar kami lebih bersemangat mengembangkan proyek ini