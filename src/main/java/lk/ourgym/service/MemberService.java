package lk.ourgym.service;

import lk.ourgym.model.Member;
import lk.ourgym.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MemberService {

    private final MemberRepository repo;

    public MemberService(MemberRepository repo) {
        this.repo = repo;
    }

    public List<Member> getAll() {
        return repo.findAll();
    }

    public Member getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Member save(Member member) {
        if (member.getId() == null) {
            member.setAddeddatetime(LocalDateTime.now());
        }
        member.setUpdateddatetime(LocalDateTime.now());
        return repo.save(member);
    }

    public Member update(Long id, Member member) {
        Member existing = getById(id);
        if (existing != null) {
            existing.setName(member.getName());
            existing.setNic(member.getNic());
            existing.setMobileno(member.getMobileno());
            existing.setEmail(member.getEmail());
            existing.setAddress(member.getAddress());
            existing.setStatus(member.getStatus());
            existing.setMembership(member.getMembership());
            existing.setUpdateddatetime(LocalDateTime.now());
            return repo.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        Member member = getById(id);
        if (member != null) {
            member.setDeleteddatetime(LocalDateTime.now());
            repo.save(member);
        }
    }

    public List<Member> search(String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword);
    }
}