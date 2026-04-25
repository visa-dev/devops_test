package lk.ourgym.service;

import lk.ourgym.model.Membership;
import lk.ourgym.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MembershipService {
    
    private final MembershipRepository membershipRepository;
    
    public List<Membership> getAll() {
        return membershipRepository.getActiveMemberships();
    }
    
    public Membership getById(Long id) {
        return membershipRepository.findById(id).orElse(null);
    }
    
    public Membership save(Membership membership) {
        if (membership.getId() == null) {
            membership.setAddeddatetime(LocalDateTime.now());
        }
        membership.setUpdateddatetime(LocalDateTime.now());
        return membershipRepository.save(membership);
    }
    
    public Membership update(Long id, Membership membership) {
        Membership existing = getById(id);
        if (existing != null) {
            existing.setName(membership.getName());
            existing.setDescription(membership.getDescription());
            existing.setPrice(membership.getPrice());
            existing.setDurationMonths(membership.getDurationMonths());
            existing.setStatus(membership.getStatus());
            existing.setTrainerType(membership.getTrainerType());
            existing.setUpdateddatetime(LocalDateTime.now());
            return membershipRepository.save(existing);
        }
        return null;
    }
    
    public void delete(Long id) {
        Membership membership = getById(id);
        if (membership != null) {
            membership.setDeleteddatetime(LocalDateTime.now());
            membershipRepository.save(membership);
        }
    }
}
